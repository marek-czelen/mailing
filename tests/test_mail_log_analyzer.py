import tempfile
import unittest
import json
from datetime import datetime
from pathlib import Path

from tools.analyze_mail_logs import (
    DeliveryEvent,
    deferred_summary_by_domain,
    delivery_groups,
    parse_log_files,
    rejection_summary_by_domain,
)


class MailLogAnalyzerTests(unittest.TestCase):
    def test_counts_retry_and_reports_acceptance_on_second_attempt(self):
        log = "\n".join(
            [
                "Oct  8 07:38:00 mail postfix/cleanup[10]: ZABC123: message-id=<campaign-1@example.test>",
                "Oct  8 07:38:30 mail postfix/smtp[11]: ZABC123: to=<person@example.test>, relay=none, delay=31, delays=1/0/30/0, dsn=4.4.1, status=deferred (connect to mx.example.test[192.0.2.1]:25: Connection timed out)",
                "Oct  8 07:39:30 mail postfix/smtp[12]: ZABC123: to=<person@example.test>, relay=mx.example.test[192.0.2.1]:25, delay=90, delays=1/0/0/89, dsn=2.0.0, status=sent (250 2.0.0 queued)",
            ]
        )
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "mail.log"
            path.write_text(log, encoding="utf-8")
            events, _, campaigns = parse_log_files([path], 2026)

        rows = delivery_groups(events, campaigns)
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["attempt_count"], 2)
        self.assertEqual(rows[0]["accepted_on_attempt"], 2)
        self.assertEqual(rows[0]["status"], "sent")
        self.assertIn("1:deferred/4.4.1 -> 2:sent/2.0.0", rows[0]["attempt_trace"])

    def test_ignores_inbound_smtpd_status_and_deduplicates_repeated_log_lines(self):
        line = "Oct  8 07:39:30 mail postfix/smtp[12]: ABC123: to=<person@example.test>, relay=mx.example.test[192.0.2.1]:25, delay=90, delays=1/0/0/89, dsn=2.0.0, status=sent (250 2.0.0 queued)"
        log = "\n".join(
            [
                "Oct  8 07:39:00 mail postfix/smtpd[9]: ABC123: to=<inbound@example.test>, status=sent",
                line,
                line,
            ]
        )
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "mail.log"
            path.write_text(log, encoding="utf-8")
            events, _, campaigns = parse_log_files([path], 2026)

        rows = delivery_groups(events, campaigns)
        self.assertEqual(len(events), 1)
        self.assertEqual(rows[0]["attempt_count"], 1)
        self.assertEqual(rows[0]["status"], "sent")

    def test_joins_postfix_queue_to_campaign_using_message_id(self):
        app_event = {
            "event": "smtp_submission_accepted",
            "timestamp": "2026-10-08T07:37:19.000Z",
            "campaign_id": "33",
            "campaign_run_id": "run-1",
            "campaign_name": "Jesień 2026",
            "contact_id": "42",
            "recipient": "person@example.test",
            "message_id": "<campaign-1@example.test>",
            "smtp_response": "250 accepted",
        }
        log = "\n".join(
            [
                f"Oct  8 07:37:19 mail [CAMPAIGN_EVENT] {json.dumps(app_event)}",
                "Oct  8 07:37:19 mail postfix/cleanup[10]: ABC123: message-id=<campaign-1@example.test>",
                "Oct  8 07:37:20 mail postfix/smtp[11]: ABC123: to=<person@example.test>, relay=mx.example.test[192.0.2.1]:25, delay=1, delays=0.1/0/0.2/0.7, dsn=2.0.0, status=sent (250 2.0.0 accepted)",
            ]
        )
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "combined.log"
            path.write_text(log, encoding="utf-8")
            events, _, campaigns = parse_log_files([path], 2026)

        rows = delivery_groups(events, campaigns)
        self.assertEqual(rows[0]["campaign_id"], "33")
        self.assertEqual(rows[0]["campaign_name"], "Jesień 2026")
        self.assertEqual(rows[0]["contact_id"], "42")
        self.assertEqual(rows[0]["message_id"], "campaign-1@example.test")

    def test_summarizes_bounced_recipient_domains_without_counting_deferred(self):
        rows = [
            {"recipient": "first@example.test", "status": "bounced", "dsn": "5.1.1", "reason": "Nieznany odbiorca", "response": "550 User unknown"},
            {"recipient": "first@example.test", "status": "bounced", "dsn": "5.1.1", "reason": "Nieznany odbiorca", "response": "550 User unknown"},
            {"recipient": "second@example.test", "status": "bounced", "dsn": "5.2.2", "reason": "Skrzynka pełna", "response": "552 Mailbox full"},
            {"recipient": "third@example.test", "status": "sent", "dsn": "2.0.0", "reason": "Przyjęto"},
            {"recipient": "fourth@example.test", "status": "deferred", "dsn": "4.4.1", "reason": "Timeout"},
            {"recipient": "person@other.test", "status": "sent", "dsn": "2.0.0", "reason": "Przyjęto"},
        ]

        summary = rejection_summary_by_domain(rows)

        self.assertEqual(len(summary), 1)
        self.assertEqual(summary[0]["domain"], "example.test")
        self.assertEqual(summary[0]["bounce_events"], 3)
        self.assertEqual(summary[0]["rejected_recipients"], 2)
        self.assertEqual(summary[0]["recipient_count"], 4)
        self.assertEqual(summary[0]["bounce_rate"], 50)
        self.assertEqual(summary[0]["top_dsn"], "5.1.1")
        self.assertEqual(summary[0]["top_response"], "550 User unknown")

    def test_summarizes_all_deferred_attempts_including_later_accepted_messages(self):
        deferred = DeliveryEvent(
            timestamp=datetime(2026, 10, 8, 7, 38),
            queue_id="Q123",
            recipient="Person@Example.test",
            status="deferred",
            dsn="4.4.1",
            relay="none",
            delay="31",
            response="connect timeout",
            raw_line="test deferred line",
            source="test.log",
        )
        accepted = DeliveryEvent(
            timestamp=datetime(2026, 10, 8, 7, 39),
            queue_id="Q123",
            recipient="Person@Example.test",
            status="sent",
            dsn="2.0.0",
            relay="mx.example.test:25",
            delay="60",
            response="250 accepted",
            raw_line="test sent line",
            source="test.log",
        )

        summary = deferred_summary_by_domain([deferred, accepted])

        self.assertEqual(len(summary), 1)
        self.assertEqual(summary[0]["domain"], "example.test")
        self.assertEqual(summary[0]["deferred_events"], 1)
        self.assertEqual(summary[0]["recipients"], 1)
        self.assertEqual(summary[0]["top_dsn"], "4.4.1")


if __name__ == "__main__":
    unittest.main()