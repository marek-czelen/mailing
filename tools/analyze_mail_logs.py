#!/usr/bin/env python3
"""Analyze Postfix and mailing-app logs into a delivery CSV and summary report."""

from __future__ import annotations

import argparse
import csv
import gzip
import json
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Iterable, TextIO


EVENT_MARKER = "[CAMPAIGN_EVENT] "
SYSLOG_PREFIX = re.compile(
    r"^(?P<month>[A-Z][a-z]{2})\s+(?P<day>\d{1,2})\s+"
    r"(?P<time>\d{2}:\d{2}:\d{2})\s+"
)
POSTFIX_PREFIX = re.compile(
    r"postfix/(?P<service>smtp|cleanup)\[\d+\]: "
    r"(?P<queue_id>[A-Za-z0-9]+): (?P<body>.*)"
)
MESSAGE_ID = re.compile(r"message-id=<([^>]*)>", re.IGNORECASE)
RECIPIENT = re.compile(r"\bto=<([^>]*)>")
STATUS = re.compile(r"\bstatus=(sent|deferred|bounced|expired)\b", re.IGNORECASE)
FIELD = re.compile(r"\b(relay|delay|dsn)=([^,\s]+)")
SMTP_CODE = re.compile(r"\b([245]\d\d)\b")

CSV_FIELDS = [
    "Data", "Czas", "ID_kolejki", "Odbiorca", "Status", "Grupa_statusu",
    "DSN", "Kod_SMTP", "Kod_rozszerzony", "Etap_SMTP", "Serwer_docelowy",
    "Czas_dostarczenia_s", "Odpowiedz_serwera", "Przyczyna", "Szczegoly_logu",
    "Wpis_logu", "ID_kampanii", "Nazwa_kampanii", "ID_kontaktu", "Message_ID",
    "Liczba_prob_Postfixa", "Przyjeto_za_proba", "Przebieg_prob", "Blad_aplikacji",
]


@dataclass(frozen=True)
class DeliveryEvent:
    timestamp: datetime
    queue_id: str
    recipient: str
    status: str
    dsn: str
    relay: str
    delay: str
    response: str
    raw_line: str
    source: str
    message_id: str = ""
    campaign_id: str = ""
    campaign_run_id: str = ""
    campaign_name: str = ""
    contact_id: str = ""


def open_log(path: Path) -> TextIO:
    if path.name.lower().endswith(".gz"):
        return gzip.open(path, "rt", encoding="utf-8", errors="replace")
    return path.open("rt", encoding="utf-8", errors="replace")


def log_files(log_dir: Path) -> list[Path]:
    return sorted(path for path in log_dir.rglob("*") if path.is_file())


def parse_timestamp(line: str, year: int) -> datetime | None:
    match = SYSLOG_PREFIX.match(line)
    if not match:
        return None
    try:
        return datetime.strptime(
            f"{year} {match['month']} {match['day']} {match['time']}",
            "%Y %b %d %H:%M:%S",
        )
    except ValueError:
        return None


def normalized_message_id(value: str) -> str:
    return value.strip().strip("<>").strip().casefold()


def parse_iso_timestamp(value: str) -> datetime | None:
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).replace(tzinfo=None)
    except ValueError:
        return None


def parse_log_files(paths: Iterable[Path], year: int) -> tuple[list[DeliveryEvent], dict[str, dict], list[dict]]:
    queue_message_ids: dict[str, str] = {}
    application_messages: dict[str, dict] = {}
    campaign_events: list[dict] = []
    raw_deliveries: list[DeliveryEvent] = []

    for path in paths:
        try:
            with open_log(path) as handle:
                for raw in handle:
                    line = raw.rstrip("\r\n")
                    if EVENT_MARKER in line:
                        try:
                            event = json.loads(line.split(EVENT_MARKER, 1)[1])
                        except json.JSONDecodeError:
                            continue
                        event["_source"] = str(path)
                        campaign_events.append(event)
                        if event.get("event") == "smtp_submission_accepted":
                            message_key = normalized_message_id(str(event.get("message_id", "")))
                            if message_key:
                                application_messages[message_key] = event
                        continue

                    timestamp = parse_timestamp(line, year)
                    if timestamp is None:
                        continue
                    postfix = POSTFIX_PREFIX.search(line)
                    if not postfix:
                        continue
                    queue_id = postfix["queue_id"]
                    body = postfix["body"]

                    if postfix["service"] == "cleanup":
                        message_match = MESSAGE_ID.search(body)
                        if message_match:
                            queue_message_ids[queue_id] = normalized_message_id(message_match[1])
                        continue

                    status_match = STATUS.search(body)
                    recipient_match = RECIPIENT.search(body)
                    if not status_match or not recipient_match:
                        continue

                    fields = dict(FIELD.findall(body))
                    response_match = re.search(
                        r"status=(?:sent|deferred|bounced|expired)\s+\((.*)\)$", body, re.IGNORECASE
                    )
                    raw_deliveries.append(
                        DeliveryEvent(
                            timestamp=timestamp,
                            queue_id=queue_id,
                            recipient=recipient_match[1],
                            status=status_match[1].lower(),
                            dsn=fields.get("dsn", ""),
                            relay=fields.get("relay", ""),
                            delay=fields.get("delay", ""),
                            response=response_match[1] if response_match else "",
                            raw_line=line,
                            source=str(path),
                        )
                    )
        except (OSError, EOFError) as error:
            print(f"Nie można odczytać {path}: {error}", file=sys.stderr)

    deliveries: list[DeliveryEvent] = []
    seen: set[tuple] = set()
    for event in raw_deliveries:
        key = (event.timestamp, event.queue_id, event.recipient.casefold(), event.status, event.raw_line)
        if key in seen:
            continue
        seen.add(key)
        message_id = queue_message_ids.get(event.queue_id, "")
        app_event = application_messages.get(message_id, {})
        deliveries.append(
            DeliveryEvent(
                **{
                    **event.__dict__,
                    "message_id": message_id,
                    "campaign_id": str(app_event.get("campaign_id", "")),
                            "campaign_run_id": str(app_event.get("campaign_run_id", "")),
                    "campaign_name": str(app_event.get("campaign_name", "")),
                    "contact_id": str(app_event.get("contact_id", "")),
                }
            )
        )
    deliveries.sort(key=lambda event: (event.timestamp, event.queue_id, event.recipient.casefold()))
    return deliveries, queue_message_ids, campaign_events


def filter_campaign_runs(
    deliveries: list[DeliveryEvent],
    campaign_events: list[dict],
    started_since: datetime | None,
    started_until: datetime | None,
) -> tuple[list[DeliveryEvent], list[dict]]:
    has_start_markers = any(event.get("event") == "campaign_started" for event in campaign_events)
    selected_runs = set()
    for event in campaign_events:
        if event.get("event") != "campaign_started":
            continue
        started_at = parse_iso_timestamp(str(event.get("timestamp", "")))
        if started_at is None:
            continue
        if started_since and started_at < started_since:
            continue
        if started_until and started_at > started_until:
            continue
        campaign_id = str(event.get("campaign_id", ""))
        run_id = str(event.get("campaign_run_id", ""))
        if campaign_id and run_id:
            selected_runs.add((campaign_id, run_id))

    if has_start_markers:
        selected_deliveries = [
            event for event in deliveries
            if (event.campaign_id, event.campaign_run_id) in selected_runs
        ]
        selected_events = [
            event for event in campaign_events
            if (str(event.get("campaign_id", "")), str(event.get("campaign_run_id", ""))) in selected_runs
        ]
        return selected_deliveries, selected_events

    first_attempts: dict[tuple[str, str], datetime] = {}
    for event in deliveries:
        key = (event.queue_id, event.recipient.casefold())
        first_attempts[key] = min(first_attempts.get(key, event.timestamp), event.timestamp)
    selected_queues = {
        key for key, timestamp in first_attempts.items()
        if (started_since is None or timestamp >= started_since)
        and (started_until is None or timestamp <= started_until)
    }
    selected_deliveries = [
        event for event in deliveries
        if (event.queue_id, event.recipient.casefold()) in selected_queues
    ]
    selected_message_ids = {event.message_id for event in selected_deliveries if event.message_id}
    selected_events = [
        event for event in campaign_events
        if normalized_message_id(str(event.get("message_id", ""))) in selected_message_ids
    ]
    return selected_deliveries, selected_events


def status_label(status: str) -> tuple[str, str]:
    return {
        "sent": ("sent", "Przyjęte przez serwer odbiorcy"),
        "deferred": ("deferred", "Odroczone; Postfix ponowi próbę"),
        "bounced": ("bounced", "Trwałe odbicie"),
        "expired": ("expired", "Wygasło w kolejce"),
        "application_failed": ("application_failed", "Błąd przekazania przez aplikację do SMTP"),
    }.get(status, (status or "unknown", "Nieznany status"))


def classify_reason(status: str, dsn: str, response: str) -> str:
    text = response.casefold()
    if status == "sent":
        return "Brak błędu w tym wpisie - serwer SMTP przyjął wiadomość"
    if "connection timed out" in text or "timed out" in text:
        return "Timeout połączenia z serwerem docelowym"
    if "connection refused" in text:
        return "Serwer docelowy odrzucił połączenie"
    if "network is unreachable" in text or "no route to host" in text:
        return "Brak trasy sieciowej do serwera docelowego"
    if "loops back to myself" in text or dsn == "5.4.6":
        return "Pętla routingu poczty"
    if status == "application_failed":
        return response or "Aplikacja nie przekazała wiadomości do serwera SMTP"
    if status == "deferred":
        return "Tymczasowy błąd dostarczenia; Postfix ponowi próbę"
    if status == "bounced":
        return "Trwały błąd dostarczenia"
    if status == "expired":
        return "Przekroczono czas przechowywania w kolejce"
    return response or "Brak opisu błędu"


def smtp_stage(status: str, response: str) -> str:
    lowered = response.casefold()
    if "connect to " in lowered:
        return "Połączenie TCP"
    if "tls" in lowered or "starttls" in lowered or "certificate" in lowered:
        return "TLS"
    if "auth" in lowered or "authentication" in lowered:
        return "Uwierzytelnienie SMTP"
    if status == "sent" or re.search(r"\b[245]\d\d\b", response):
        return "Odpowiedź SMTP serwera docelowego"
    return "Dostarczanie SMTP"


def smtp_code(response: str) -> str:
    match = SMTP_CODE.search(response)
    return match[1] if match else ""


def delivery_groups(deliveries: list[DeliveryEvent], campaign_events: list[dict]) -> list[dict]:
    groups: dict[tuple[str, str, str, str], list[DeliveryEvent]] = defaultdict(list)
    for event in deliveries:
        if event.campaign_id and event.campaign_run_id:
            key = ("campaign", event.campaign_id, event.campaign_run_id, event.recipient.casefold())
        else:
            key = ("queue", event.queue_id, "", event.recipient.casefold())
        groups[key].append(event)

    app_failures: dict[tuple[str, str, str], list[dict]] = defaultdict(list)
    for event in campaign_events:
        if event.get("event") == "smtp_submission_failed":
            key = (
                str(event.get("campaign_id", "")),
                str(event.get("campaign_run_id", "")),
                str(event.get("recipient", "")).casefold(),
            )
            app_failures[key].append(event)

    rows = []
    for _, events in groups.items():
        events.sort(key=lambda event: event.timestamp)
        last = events[-1]
        accepted = next((index for index, event in enumerate(events, start=1) if event.status == "sent"), None)
        attempt_trace = " -> ".join(
            f"{index}:{event.status}/{event.dsn or '-'}" for index, event in enumerate(events, start=1)
        )
        failure_key = (last.campaign_id, last.campaign_run_id, last.recipient.casefold())
        failures = app_failures.get(failure_key, [])
        campaign_id = last.campaign_id or (str(failures[-1].get("campaign_id", "")) if failures else "")
        rows.append(
            {
                "timestamp": last.timestamp,
                "queue_id": last.queue_id,
                "recipient": last.recipient,
                "status": last.status,
                "dsn": last.dsn,
                "relay": last.relay,
                "delay": last.delay,
                "response": last.response,
                "reason": classify_reason(last.status, last.dsn, last.response),
                "smtp_stage": smtp_stage(last.status, last.response),
                "smtp_code": smtp_code(last.response),
                "attempt_count": len(events),
                "accepted_on_attempt": accepted or "",
                "attempt_trace": attempt_trace,
                "campaign_id": campaign_id,
                "campaign_run_id": last.campaign_run_id or (str(failures[-1].get("campaign_run_id", "")) if failures else ""),
                "campaign_name": last.campaign_name or (str(failures[-1].get("campaign_name", "")) if failures else ""),
                "contact_id": last.contact_id or (str(failures[-1].get("contact_id", "")) if failures else ""),
                "message_id": last.message_id,
                "app_error": "; ".join(str(item.get("error", "")) for item in failures if item.get("error")),
                "raw_lines": " || ".join(event.raw_line for event in events),
            }
        )

    known_failure_keys = {
        (row["campaign_id"], row["campaign_run_id"], row["recipient"].casefold())
        for row in rows if row["campaign_id"]
    }
    for (campaign_id, campaign_run_id, recipient_key), failures in app_failures.items():
        if not failures or (campaign_id, campaign_run_id, recipient_key) in known_failure_keys:
            continue
        failure = failures[-1]
        error = str(failure.get("error", "Błąd przekazania do SMTP"))
        timestamp = parse_iso_timestamp(str(failure.get("timestamp", ""))) or datetime.min
        rows.append(
            {
                "timestamp": timestamp,
                "queue_id": "",
                "recipient": str(failure.get("recipient", "")),
                "status": "application_failed",
                "dsn": "",
                "relay": "",
                "delay": "",
                "response": error,
                "reason": classify_reason("application_failed", "", error),
                "smtp_stage": "Przekazanie z aplikacji do SMTP",
                "smtp_code": "",
                "attempt_count": 0,
                "accepted_on_attempt": "",
                "attempt_trace": "",
                "campaign_id": campaign_id,
                "campaign_run_id": campaign_run_id,
                "campaign_name": str(failure.get("campaign_name", "")),
                "contact_id": str(failure.get("contact_id", "")),
                "message_id": "",
                "app_error": error,
                "raw_lines": "",
            }
        )

    rows.sort(key=lambda row: (row["timestamp"], row["campaign_id"], row["recipient"].casefold()))
    return rows


def campaign_summary(campaign_events: list[dict], rows: list[dict]) -> list[dict]:
    campaigns: dict[str, dict] = {}
    for event in campaign_events:
        campaign_id = str(event.get("campaign_id", ""))
        if not campaign_id:
            continue
        item = campaigns.setdefault(
            campaign_id,
            {"campaign_id": campaign_id, "campaign_name": str(event.get("campaign_name", "")), "runs": {}},
        )
        run_id = str(event.get("campaign_run_id", "legacy"))
        run = item["runs"].setdefault(run_id, {})
        if event.get("event") == "campaign_started":
            run["started_at"] = str(event.get("timestamp", ""))
            run["expected_recipients"] = int(event.get("recipient_count", 0) or 0)
        elif event.get("event") == "campaign_finished":
            run["finished_at"] = str(event.get("timestamp", ""))
            run["submitted_count"] = int(event.get("submitted_count", 0) or 0)
            run["failed_count"] = int(event.get("failed_count", 0) or 0)

    rows_by_campaign: dict[str, list[dict]] = defaultdict(list)
    for row in rows:
        if row["campaign_id"]:
            rows_by_campaign[row["campaign_id"]].append(row)

    summaries = []
    for campaign_id, item in campaigns.items():
        related = rows_by_campaign[campaign_id]
        status_counts = Counter(row["status"] for row in related)
        runs = sorted(item["runs"].values(), key=lambda run: run.get("started_at", ""))
        summaries.append(
            {
                **item,
                "runs": runs,
                "recipient_count": sum(int(run.get("expected_recipients", 0)) for run in runs),
                "accepted": status_counts["sent"],
                "deferred": status_counts["deferred"],
                "bounced": status_counts["bounced"],
                "other": sum(count for status, count in status_counts.items() if status not in {"sent", "deferred", "bounced"}),
            }
        )
    return sorted(summaries, key=lambda item: (item["campaign_name"].casefold(), item["campaign_id"]))


def rejection_summary_by_domain(rows: list[dict]) -> list[dict]:
    domains: dict[str, dict] = defaultdict(lambda: {"recipients": set(), "rejected": set(), "bounces": 0, "dsns": Counter(), "reasons": Counter(), "responses": Counter()})
    for row in rows:
        recipient = str(row.get("recipient", "")).strip().casefold()
        if "@" not in recipient:
            domain = "(brak domeny)"
        else:
            domain = recipient.rsplit("@", 1)[1].rstrip(".")
            if not domain:
                domain = "(brak domeny)"
            else:
                try:
                    domain = domain.encode("idna").decode("ascii")
                except UnicodeError:
                    domain = domain.casefold()

        item = domains[domain]
        item["recipients"].add(recipient)
        if row.get("status") == "bounced":
            item["rejected"].add(recipient)
            item["bounces"] += 1
            item["dsns"][str(row.get("dsn") or "brak DSN")] += 1
            item["reasons"][str(row.get("reason") or "Brak opisu")] += 1
            response = str(row.get("response") or "Brak odpowiedzi serwera")
            item["responses"][response] += 1

    summaries = []
    for domain, item in domains.items():
        if not item["bounces"]:
            continue
        recipient_count = len(item["recipients"])
        summaries.append(
            {
                "domain": domain,
                "bounce_events": item["bounces"],
                "rejected_recipients": len(item["rejected"]),
                "recipient_count": recipient_count,
                "bounce_rate": len(item["rejected"]) / recipient_count * 100 if recipient_count else 0,
                "top_dsn": item["dsns"].most_common(1)[0][0],
                "top_reason": item["reasons"].most_common(1)[0][0],
                "top_response": item["responses"].most_common(1)[0][0],
            }
        )
    return sorted(summaries, key=lambda item: (-item["bounce_events"], item["domain"]))


def deferred_summary_by_domain(deliveries: list[DeliveryEvent]) -> list[dict]:
    domains: dict[str, dict] = defaultdict(lambda: {"recipients": set(), "events": 0, "dsns": Counter(), "responses": Counter()})
    for event in deliveries:
        if event.status != "deferred":
            continue
        recipient = event.recipient.strip().casefold()
        if "@" not in recipient or not recipient.rsplit("@", 1)[1].rstrip("."):
            domain = "(brak domeny)"
        else:
            domain = recipient.rsplit("@", 1)[1].rstrip(".")
            try:
                domain = domain.encode("idna").decode("ascii")
            except UnicodeError:
                domain = domain.casefold()

        item = domains[domain]
        item["recipients"].add(recipient)
        item["events"] += 1
        item["dsns"][event.dsn or "brak DSN"] += 1
        item["responses"][event.response or "Brak odpowiedzi serwera"] += 1

    summaries = []
    for domain, item in domains.items():
        summaries.append(
            {
                "domain": domain,
                "deferred_events": item["events"],
                "recipients": len(item["recipients"]),
                "top_dsn": item["dsns"].most_common(1)[0][0],
                "top_response": item["responses"].most_common(1)[0][0],
            }
        )
    return sorted(summaries, key=lambda item: (-item["deferred_events"], item["domain"]))


def write_csv(path: Path, rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=CSV_FIELDS, delimiter=";", extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            timestamp = row["timestamp"]
            writer.writerow(
                {
                    "Data": timestamp.date().isoformat() if timestamp != datetime.min else "",
                    "Czas": timestamp.time().isoformat() if timestamp != datetime.min else "",
                    "ID_kolejki": row["queue_id"],
                    "Odbiorca": row["recipient"],
                    "Status": row["status"],
                    "Grupa_statusu": status_label(row["status"])[1],
                    "DSN": row["dsn"],
                    "Kod_SMTP": row["smtp_code"],
                    "Kod_rozszerzony": row["dsn"],
                    "Etap_SMTP": row["smtp_stage"],
                    "Serwer_docelowy": row["relay"] or "none",
                    "Czas_dostarczenia_s": row["delay"],
                    "Odpowiedz_serwera": row["response"],
                    "Przyczyna": row["reason"],
                    "Szczegoly_logu": row["response"],
                    "Wpis_logu": row["raw_lines"],
                    "ID_kampanii": row["campaign_id"],
                    "Nazwa_kampanii": row["campaign_name"],
                    "ID_kontaktu": row["contact_id"],
                    "Message_ID": row["message_id"],
                    "Liczba_prob_Postfixa": row["attempt_count"],
                    "Przyjeto_za_proba": row["accepted_on_attempt"],
                    "Przebieg_prob": row["attempt_trace"],
                    "Blad_aplikacji": row["app_error"],
                }
            )


def write_report(
    path: Path,
    log_dirs: list[Path],
    files: list[Path],
    deliveries: list[DeliveryEvent],
    rows: list[dict],
    events: list[dict],
    selection_scope: str = "",
) -> None:
    status_counts = Counter(row["status"] for row in rows)
    event_counts = Counter(event.status for event in deliveries)
    reasons = Counter(row["reason"] for row in rows if row["status"] != "sent")
    accepted_after_retry = Counter(
        row["accepted_on_attempt"] for row in rows if row["status"] == "sent" and row["accepted_on_attempt"]
    )
    campaigns = campaign_summary(events, rows)
    rejection_domains = rejection_summary_by_domain(rows)
    deferred_domains = deferred_summary_by_domain(deliveries)
    timestamps = [event.timestamp for event in deliveries]
    lines = [
        "# Raport analizy wysyłki", "",
        f"- Wygenerowano: {datetime.now().astimezone().isoformat(timespec='seconds')}",
        f"- Źródła logów: {', '.join(f'`{directory}`' for directory in log_dirs)}", f"- Plików wejściowych: {len(files)}",
        *([f"- Zakres wyboru: {selection_scope}"] if selection_scope else []),
        f"- Zakres zdarzeń Postfix: {min(timestamps).isoformat(sep=' ') if timestamps else 'brak'} - {max(timestamps).isoformat(sep=' ') if timestamps else 'brak'}",
        f"- Końcowych wpisów SMTP: {len(deliveries)}; rekordów odbiorca/kampania: {len(rows)}", "",
        "## Wynik końcowy na adres/kampanię", "", "| Status | Liczba |", "|---|---:|",
    ]
    for status, count in sorted(status_counts.items()):
        lines.append(f"| {status_label(status)[1]} ({status}) | {count} |")
    lines.extend(["", "## Próby dostarczenia Postfixa", "", "| Status zdarzenia | Liczba wpisów |", "|---|---:|"])
    for status, count in sorted(event_counts.items()):
        lines.append(f"| {status} | {count} |")
    lines.extend(["", "## Przyjęte po ponowieniach", "", "| Numer próby | Liczba adresów |", "|---:|---:|"])
    for attempt, count in sorted(accepted_after_retry.items(), key=lambda pair: int(pair[0])):
        lines.append(f"| {attempt} | {count} |")
    lines.extend(["", "## Najczęstsze przyczyny niepowodzeń", "", "| Przyczyna | Liczba |", "|---|---:|"])
    for reason, count in reasons.most_common(20):
        lines.append(f"| {reason.replace('|', '/')} | {count} |")
    lines.extend(
        [
            "",
            "## Domeny odbiorców z trwałymi odrzuceniami",
            "",
            "Ranking dotyczy wyłącznie końcowego statusu `bounced`; tymczasowe `deferred` są raportowane osobno.",
            "",
            "| Domena odbiorcy | Odbicia | Unikalne adresy odbite | Unikalne adresy w logu | Odsetek adresów odbitych | Najczęstszy DSN | Główna przyczyna | Najczęstsza odpowiedź SMTP |",
            "|---|---:|---:|---:|---:|---|---|---|",
        ]
    )
    for item in rejection_domains[:50]:
        lines.append(
            f"| {item['domain']} | {item['bounce_events']} | {item['rejected_recipients']} | "
            f"{item['recipient_count']} | {item['bounce_rate']:.1f}% | {item['top_dsn']} | "
            f"{item['top_reason'].replace('|', '/')} | {item['top_response'][:160].replace('|', '/')} |"
        )
    if not rejection_domains:
        lines.append("| Brak trwałych odrzuceń | 0 | 0 | 0 | 0.0% | - | - | - |")
    lines.extend(
        [
            "",
            "## Domeny odbiorców z odroczeniami",
            "",
            "Zestawienie obejmuje wszystkie zdarzenia `deferred`, także te, po których późniejsza próba zakończyła się `sent`.",
            "",
            "| Domena odbiorcy | Zdarzenia deferred | Unikalne adresy | Najczęstszy DSN | Najczęstsza odpowiedź SMTP |",
            "|---|---:|---:|---|---|",
        ]
    )
    for item in deferred_domains[:50]:
        lines.append(
            f"| {item['domain']} | {item['deferred_events']} | {item['recipients']} | {item['top_dsn']} | "
            f"{item['top_response'][:160].replace('|', '/')} |"
        )
    if not deferred_domains:
        lines.append("| Brak odroczeń | 0 | 0 | - | - |")
    lines.extend(["", "## Kampanie z oznacznikami aplikacji", ""])
    if campaigns:
        lines.extend(["| Kampania | Starty | Odbiorcy planowani | Przyjęte przez MX | Odroczone | Odbite |", "|---|---:|---:|---:|---:|---:|"])
        for campaign in campaigns:
            starts = ", ".join(run.get("started_at", "") for run in campaign["runs"] if run.get("started_at")) or "brak"
            lines.append(
                f"| {campaign['campaign_name'] or campaign['campaign_id']} ({campaign['campaign_id']}) | "
                f"{starts} | {campaign['recipient_count']} | {campaign['accepted']} | {campaign['deferred']} | {campaign['bounced']} |"
            )
    else:
        lines.append("Nie znaleziono zdarzeń `[CAMPAIGN_EVENT]`. Dane kampanii będą dostępne dla logów zapisanych po wdrożeniu nowego logowania aplikacji.")
    lines.extend(
        ["", "## Interpretacja", "",
         "`sent` oznacza, że zdalny serwer SMTP przyjął wiadomość, nie potwierdza dostarczenia do skrzynki odbiorczej. Numer próby jest liczony z kolejnych końcowych wpisów Postfixa dla tej samej kolejki i odbiorcy. Filtry `--started-*` używają zdarzeń startu kampanii, jeśli są zapisane; bez nich wybierają wiadomości według czasu pierwszej próby SMTP i zachowują ich kolejne ponowienia. Zdarzenia aplikacji są łączone z kolejką przez `Message-ID`, a nie na podstawie przybliżonego czasu.", "",
         "Przypisanie do kampanii jest puste dla historycznych wpisów, których `Message-ID` nie występuje w logu aplikacji. Skrypt nie zgaduje kampanii na podstawie samego sąsiedztwa czasowego.", ""]
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def build_parser() -> argparse.ArgumentParser:
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description="Tworzy raport wysyłki z logów Postfixa i aplikacji mailingowej.")
    parser.add_argument("--log-dir", type=Path, default=root / "log", help="Katalog wejściowy z logami (domyślnie ./log).")
    parser.add_argument("--log-file", type=Path, help="Pojedynczy plik logu, np. ./mail.log.")
    parser.add_argument("--app-log-dir", type=Path, default=root / "backend" / "logs", help="Dodatkowy katalog logów aplikacji/PM2.")
    parser.add_argument("--output-dir", type=Path, default=root / "reports", help="Katalog wyjściowy (domyślnie ./reports).")
    parser.add_argument("--year", type=int, default=datetime.now().year, help="Rok wpisów syslog bez roku (domyślnie bieżący).")
    parser.add_argument("--since", type=date.fromisoformat, help="Uwzględnij zdarzenia od daty YYYY-MM-DD.")
    parser.add_argument("--until", type=date.fromisoformat, help="Uwzględnij zdarzenia do daty YYYY-MM-DD włącznie.")
    parser.add_argument("--started-since", type=parse_datetime_argument, help="Wybierz kampanie rozpoczęte od YYYY-MM-DDTHH:MM:SS.")
    parser.add_argument("--started-until", type=parse_datetime_argument, help="Wybierz kampanie rozpoczęte do YYYY-MM-DDTHH:MM:SS.")
    return parser


def parse_datetime_argument(value: str) -> datetime:
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).replace(tzinfo=None)
    except ValueError as error:
        raise argparse.ArgumentTypeError("Użyj formatu YYYY-MM-DDTHH:MM:SS.") from error


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if args.started_since and args.started_until and args.started_since > args.started_until:
        print("--started-since nie może być późniejsze niż --started-until.", file=sys.stderr)
        return 2
    if (args.started_since or args.started_until) and (args.since or args.until):
        print("Nie łącz filtrów startu kampanii (--started-*) z filtrami dat wpisów (--since/--until).", file=sys.stderr)
        return 2
    if args.log_file and not args.log_file.is_file():
        print(f"Plik logu nie istnieje: {args.log_file}", file=sys.stderr)
        return 2
    if not args.log_file and not args.log_dir.is_dir():
        print(f"Katalog logów nie istnieje: {args.log_dir}", file=sys.stderr)
        return 2
    log_dirs = [args.log_file] if args.log_file else [args.log_dir]
    if args.app_log_dir.is_dir() and args.app_log_dir.resolve() not in {path.resolve() for path in log_dirs}:
        log_dirs.append(args.app_log_dir)
    files = sorted({
        path
        for source in log_dirs
        for path in ([source] if source.is_file() else log_files(source))
    })
    if not files:
        print("Brak plików wejściowych.", file=sys.stderr)
        return 2

    deliveries, _, campaign_events = parse_log_files(files, args.year)
    if args.started_since or args.started_until:
        deliveries, campaign_events = filter_campaign_runs(
            deliveries, campaign_events, args.started_since, args.started_until
        )
    elif args.since:
        lower = datetime.combine(args.since, datetime.min.time())
        deliveries = [event for event in deliveries if event.timestamp >= lower]
        campaign_events = [event for event in campaign_events if (parse_iso_timestamp(str(event.get("timestamp", ""))) or datetime.min).date() >= args.since]
    if args.until:
        upper = datetime.combine(args.until, datetime.max.time())
        deliveries = [event for event in deliveries if event.timestamp <= upper]
        campaign_events = [event for event in campaign_events if (parse_iso_timestamp(str(event.get("timestamp", ""))) or datetime.min).date() <= args.until]

    rows = delivery_groups(deliveries, campaign_events)
    date_tokens = [event.timestamp.date().isoformat() for event in deliveries]
    if date_tokens:
        suffix = f"{min(date_tokens)}_{max(date_tokens)}"
    elif args.started_since or args.started_until:
        lower = args.started_since.date().isoformat() if args.started_since else "od-poczatku"
        upper = args.started_until.date().isoformat() if args.started_until else "bez-konca"
        suffix = f"{lower}_{upper}"
    elif args.since or args.until:
        lower = args.since.isoformat() if args.since else "od-poczatku"
        upper = args.until.isoformat() if args.until else "bez-konca"
        suffix = f"{lower}_{upper}"
    else:
        suffix = "brak-zdarzen"
    csv_path = args.output_dir / f"mail-delivery-{suffix}.csv"
    report_path = args.output_dir / f"mail-delivery-report-{suffix}.md"
    write_csv(csv_path, rows)
    if args.started_since or args.started_until:
        selection_scope = (
            f"start kampanii (lub pierwsza próba SMTP bez znaczników kampanii) od "
            f"{args.started_since.isoformat(sep=' ') if args.started_since else 'początku'} "
            f"do {args.started_until.isoformat(sep=' ') if args.started_until else 'teraz'}"
        )
    elif args.since or args.until:
        selection_scope = f"daty zdarzeń od {args.since or 'początku'} do {args.until or 'teraz'}"
    else:
        selection_scope = "wszystkie dostępne zdarzenia"
    write_report(report_path, log_dirs, files, deliveries, rows, campaign_events, selection_scope)
    print(f"CSV: {csv_path}")
    print(f"Raport: {report_path}")
    print(f"Zdarzenia SMTP: {len(deliveries)}; rekordy odbiorca/kampania: {len(rows)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())