-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Czas generowania: 05 Paź 2026, 20:25
-- Wersja serwera: 10.3.39-MariaDB-0ubuntu0.20.04.2
-- Wersja PHP: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Baza danych: `mailing`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `campaign_database_link`
--

CREATE TABLE `campaign_database_link` (
  `database_id` int(11) DEFAULT NULL,
  `campaign_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `campaign_replies`
--

CREATE TABLE `campaign_replies` (
  `id` int(10) UNSIGNED NOT NULL,
  `campaign_id` int(11) NOT NULL,
  `mail_address_id` int(11) DEFAULT NULL,
  `from_email` varchar(320) NOT NULL,
  `subject` varchar(500) DEFAULT NULL,
  `received_at` datetime NOT NULL,
  `message_id` varchar(500) DEFAULT NULL,
  `reply_hash` varchar(64) NOT NULL,
  `imap_uid` varchar(50) DEFAULT NULL,
  `body_preview` text DEFAULT NULL,
  `body_full` mediumtext DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `is_bounce` tinyint(1) NOT NULL DEFAULT 0,
  `bounce_type` varchar(50) DEFAULT NULL,
  `bounce_reason` text DEFAULT NULL,
  `read_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Zrzut danych tabeli `campaign_replies`
--

INSERT INTO `campaign_replies` (`id`, `campaign_id`, `mail_address_id`, `from_email`, `subject`, `received_at`, `message_id`, `reply_hash`, `imap_uid`, `body_preview`, `body_full`, `is_read`, `is_bounce`, `bounce_type`, `bounce_reason`, `read_at`, `created_at`) VALUES
(18, 27, 30029, 'czelen@verx.pl', 'RE: test', '2025-11-09 19:45:06', '<007001dc51b1$591ee350$0b5ca9f0$@verx.pl>', '595747079ad2450404889da0576431a95b242288', '18', 'This is a multipart message in MIME format.\r\n\r\n------=_NextPart_000_0071_01DC51B9.BAE59540\r\nContent-Type: multipart/alternative;\r\n	boundary=\"----=_NextPart_001_0072_01DC51B9.BAE59540\"\r\n\r\n\r\n------=_NextPart_001_0072_01DC51B9.BAE59540\r\nContent-Type: text/plain;\r\n	charset=\"utf-8\"\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\ndasdasdasqweqweqwe\r\n\r\n \r\n\r\nFrom: sprzedaz@verx.pl <sprzedaz@verx.pl> \r\nSent: Sunday, November 9, 2025 7:46 PM\r\nTo: czelen@verx.pl\r\nSubject: test\r\n\r\n \r\n\r\n \r\n\r\npromocja, wyprze', 'Return-Path: <czelen@verx.pl>\r\nDelivered-To: sprzedaz@verx.pl\r\nReceived: from mail.aculeo.pl\r\n	by aculeo.pl with LMTP\r\n	id +OqEOELvEGk0kwEAzMis/A\r\n	(envelope-from <czelen@verx.pl>)\r\n	for <sprzedaz@verx.pl>; Sun, 09 Nov 2025 20:45:06 +0100\r\nReceived: from DESKTOPR8FEKAU (unknown [45.149.209.134])\r\n	by mail.aculeo.pl (Postfix) with ESMTPSA id CA2CD6013C4\r\n	for <sprzedaz@verx.pl>; Sun,  9 Nov 2025 20:45:05 +0100 (CET)\r\nDKIM-Signature: v=1; a=rsa-sha256; c=relaxed/simple; d=verx.pl; s=default;\r\n	t=1762717506; bh=Q9ffcFPGafqm6VsrgcY3gu7ru2pEN0kwmHz5ba+rTy8=;\r\n	h=From:To:References:In-Reply-To:Subject:Date:From;\r\n	b=Rfg1iGbzA7eK0mOkt9Xi7uOubMbdr1b+vsjMTS3wRmTQx3+9QTkiQDqGtRNXnsdDS\r\n	 49XaODK25Jhjoes6EhYx45YMWyKTxY9WOF0K/6mcgj3CaWnDjMDnIda6vL6s5KuYHv\r\n	 BQCeDeIvqTgjDmmrsNfevMKDoPR6VYnlzr2yXzMKCPQN7jubi0Wf4TrvLyDoNXBWFm\r\n	 UHmOmsJueMrD7gxPnoMk7PBhpWryHggNpEo+IGCf6mFo0AGkdESf0x/nCywOfzkFnd\r\n	 iFFKf47HMsFip9UuHDr2jlqDYfTgyVUaikPJ1/d8ArLW0HyFSSfsiVpk/ok4mH3Zft\r\n	 ezAxzZrsTBmUA==\r\nFrom: <czelen@verx.pl>\r\nTo: <sprzedaz@verx.pl>\r\nReferences: <1762713932238.xxglnw1zort@localhost>\r\nIn-Reply-To: <1762713932238.xxglnw1zort@localhost>\r\nSubject: RE: test\r\nDate: Sun, 9 Nov 2025 20:45:04 +0100\r\nMessage-ID: <007001dc51b1$591ee350$0b5ca9f0$@verx.pl>\r\nMIME-Version: 1.0\r\nContent-Type: multipart/related;\r\n	boundary=\"----=_NextPart_000_0071_01DC51B9.BAE59540\"\r\nX-Mailer: Microsoft Outlook 16.0\r\nThread-Index: AQGsR5FoK7zX5OKkCX0m+dmwut0yxrVK04hQ\r\nContent-Language: pl\r\nX-Antivirus: Avast (VPS 251109-4, 9.11.2025), Outbound message\r\nX-Antivirus-Status: Clean\r\nX-Antivirus: Avast (VPS 251109-4, 9.11.2025), Inbound message\r\nX-Antivirus-Status: Clean\r\n\r\nThis is a multipart message in MIME format.\r\n\r\n------=_NextPart_000_0071_01DC51B9.BAE59540\r\nContent-Type: multipart/alternative;\r\n	boundary=\"----=_NextPart_001_0072_01DC51B9.BAE59540\"\r\n\r\n\r\n------=_NextPart_001_0072_01DC51B9.BAE59540\r\nContent-Type: text/plain;\r\n	charset=\"utf-8\"\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\ndasdasdasqweqweqwe\r\n\r\n \r\n\r\nFrom: sprzedaz@verx.pl <sprzedaz@verx.pl> \r\nSent: Sunday, November 9, 2025 7:46 PM\r\nTo: czelen@verx.pl\r\nSubject: test\r\n\r\n \r\n\r\n \r\n\r\npromocja, wyprzeda=C5=BC\r\n\r\nOtrzyma=C5=82e=C5=9B(-a=C5=9B) t=C4=99 wiadomo=C5=9B=C4=87, poniewa=C5=BC a=\r\ndres e-mail znajduje si=C4=99 w naszej bazie. Administratorem danych jest D=\r\nevelopment Company (Development Address). Je=C5=9Bli nie chcesz otrzymywa=\r\n=C4=87 od nas wiadomo=C5=9Bci, mo=C5=BCesz si=C4=99 wypisa=C4=87 klikaj=C4=\r\n=85c  <http://localhost:5173/unsubscribe/GNydufdgizcgRAbAw1G_AIsPP-m1IOZYPX=\r\nmPqK5xxRE> tutaj.\r\n\r\n \r\n\r\n \r\n\r\n\r\n <https://www.avast.com/sig-email?utm_medium=3Demail&utm_source=3Dlink&utm_=\r\ncampaign=3Dsig-email&utm_content=3Demailclient> \r\n\r\nNie zawiera wirus=C3=B3w. <https://www.avast.com/sig-email?utm_medium=3Dema=\r\nil&utm_source=3Dlink&utm_campaign=3Dsig-email&utm_content=3Demailclient> ww=\r\nw.avast.com\r\n\r\n \r\n\r\n\r\n\r\n-- \r\nTa wiadomo=C5=9B=C4=87 e-mail zosta=C5=82a sprawdzona pod k=C4=85tem wirus=\r\n=C3=B3w przez oprogramowanie antywirusowe Avast.\r\nwww.avast.com\r\n------=_NextPart_001_0072_01DC51B9.BAE59540\r\nContent-Type: text/html;\r\n	charset=\"utf-8\"\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n<html xmlns:v=3D\"urn:schemas-microsoft-com:vml\" =\r\nxmlns:o=3D\"urn:schemas-microsoft-com:office:office\" =\r\nxmlns:w=3D\"urn:schemas-microsoft-com:office:word\" =\r\nxmlns:m=3D\"http://schemas.microsoft.com/office/2004/12/omml\" =\r\nxmlns=3D\"http://www.w3.org/TR/REC-html40\"><head><meta =\r\nhttp-equiv=3DContent-Type content=3D\"text/html; charset=3Dutf-8\"><meta =\r\nname=3DGenerator content=3D\"Microsoft Word 15 (filtered medium)\"><!--[if =\r\n!mso]><style>v\\:* {behavior:url(#default#VML);}\r\no\\:* {behavior:url(#default#VML);}\r\nw\\:* {behavior:url(#default#VML);}\r\n.shape {behavior:url(#default#VML);}\r\n</style><![endif]--><style><!--\r\n/* Font Definitions */\r\n@font-face\r\n	{font-family:\"Cambria Math\";\r\n	panose-1:2 4 5 3 5 4 6 3 2 4;}\r\n@font-face\r\n	{font-family:Calibri;\r\n	panose-1:2 15 5 2 2 2 4 3 2 4;}\r\n@font-face\r\n	{font-family:Aptos;}\r\n/* Style Definitions */\r\np.MsoNormal, li.MsoNormal, div.MsoNormal\r\n	{margin:0cm;\r\n	font-size:12.0pt;\r\n	font-family:\"Aptos\",sans-serif;}\r\na:link, span.MsoHyperlink\r\n	{mso-style-priority:99;\r\n	color:blue;\r\n	text-decoration:underline;}\r\nspan.Stylwiadomocie-mail19\r\n	{mso-style-type:personal-reply;\r\n	font-family:\"Calibri\",sans-serif;\r\n	color:windowtext;}\r\n.MsoChpDefault\r\n	{mso-style-type:export-only;\r\n	font-size:11.0pt;\r\n	mso-fareast-language:EN-US;}\r\n@page WordSection1\r\n	{size:612.0pt 792.0pt;\r\n	margin:70.85pt 70.85pt 70.85pt 70.85pt;}\r\ndiv.WordSection1\r\n	{page:WordSection1;}\r\n--></style></head><body lang=3DPL link=3Dblue vlink=3Dpurple =\r\nstyle=3D\'word-wrap:break-word\'><div class=3DWordSection1><p =\r\nclass=3DMsoNormal><span =\r\nstyle=3D\'font-size:11.0pt;font-family:\"Calibri\",sans-serif;mso-fareast-la=\r\nnguage:EN-US\'>dasdasdasqweqweqwe<o:p></o:p></span></p><p =\r\nclass=3DMsoNormal><span =\r\nstyle=3D\'font-size:11.0pt;font-family:\"Calibri\",sans-serif;mso-fareast-la=\r\nnguage:EN-US\'><o:p>&nbsp;</o:p></span></p><div =\r\nstyle=3D\'border:none;border-top:solid #E1E1E1 1.0pt;padding:3.0pt 0cm =\r\n0cm 0cm\'><p class=3DMsoNormal><b><span =\r\nstyle=3D\'font-size:11.0pt;font-family:\"Calibri\",sans-serif\'>From:</span><=\r\n/b><span style=3D\'font-size:11.0pt;font-family:\"Calibri\",sans-serif\'> =\r\nsprzedaz@verx.pl &lt;sprzedaz@verx.pl&gt; <br><b>Sent:</b> Sunday, =\r\nNovember 9, 2025 7:46 PM<br><b>To:</b> czelen@verx.pl<br><b>Subject:</b> =\r\ntest<o:p></o:p></span></p></div><p =\r\nclass=3DMsoNormal><o:p>&nbsp;</o:p></p><p>&nbsp;<o:p></o:p></p><div =\r\nstyle=3D\'border:none;border-top:solid #EEEEEE 1.0pt;padding:9.0pt 0cm =\r\n0cm 0cm;margin-top:18.0pt\'><p class=3DMsoNormal align=3Dcenter =\r\nstyle=3D\'text-align:center\'><span =\r\nstyle=3D\'font-size:9.0pt;color:#666666\'>promocja, =\r\nwyprzeda=C5=BC<o:p></o:p></span></p></div><div =\r\nstyle=3D\'border:none;border-top:solid #EEEEEE 1.0pt;padding:9.0pt 0cm =\r\n0cm 0cm;margin-top:18.0pt\'><p class=3DMsoNormal align=3Dcenter =\r\nstyle=3D\'text-align:center\'><span =\r\nstyle=3D\'font-size:9.0pt;color:#666666\'>Otrzyma=C5=82e=C5=9B(-a=C5=9B) =\r\nt=C4=99 wiadomo=C5=9B=C4=87, poniewa=C5=BC adres e-mail znajduje =\r\nsi=C4=99 w naszej bazie. Administratorem danych jest Development Company =\r\n(Development Address). Je=C5=9Bli nie chcesz otrzymywa=C4=87 od nas =\r\nwiadomo=C5=9Bci, mo=C5=BCesz si=C4=99 wypisa=C4=87 klikaj=C4=85c <a =\r\nhref=3D\"http://localhost:5173/unsubscribe/GNydufdgizcgRAbAw1G_AIsPP-m1IOZ=\r\nYPXmPqK5xxRE\"><span =\r\nstyle=3D\'color:#666666\'>tutaj</span></a>.<o:p></o:p></span></p></div><p>&=\r\nnbsp;<o:p></o:p></p><div id=3DDAB4FAD8-2DD7-40BB-A1B8-4E2AA1F9FDF2><p =\r\nclass=3DMsoNormal><o:p>&nbsp;</o:p></p><table class=3DMsoNormalTable =\r\nborder=3D1 cellspacing=3D3 cellpadding=3D0 =\r\nstyle=3D\'border:none;border-top:solid #D3D4DE 1.0pt\'><tr><td width=3D55 =\r\nstyle=3D\'width:41.25pt;border:none;padding:9.75pt .75pt .75pt .75pt\'><p =\r\nclass=3DMsoNormal><a =\r\nhref=3D\"https://www.avast.com/sig-email?utm_medium=3Demail&amp;utm_source=\r\n=3Dlink&amp;utm_campaign=3Dsig-email&amp;utm_content=3Demailclient\" =\r\ntarget=3D\"_blank\"><span style=3D\'border:solid windowtext =\r\n1.0pt;padding:0cm;text-decoration:none\'><img border=3D0 width=3D46 =\r\nheight=3D29 style=3D\'width:.4833in;height:.3in\' id=3D\"Obraz_x0020_1\" =\r\nsrc=3D\"cid:~WRD0480.jpg\" alt=3D\"Obraz usuni=C4=99ty przez =\r\nnadawc=C4=99.\"></span></a><o:p></o:p></p></td><td width=3D470 =\r\nstyle=3D\'width:352.5pt;border:none;padding:9.0pt .75pt .75pt .75pt\'><p =\r\nclass=3DMsoNormal style=3D\'line-height:13.5pt\'><span =\r\nstyle=3D\'font-size:10.0pt;font-family:\"Arial\",sans-serif;color:#41424E\'>N=\r\nie zawiera wirus=C3=B3w.<a =\r\nhref=3D\"https://www.avast.com/sig-email?utm_medium=3Demail&amp;utm_source=\r\n=3Dlink&amp;utm_campaign=3Dsig-email&amp;utm_content=3Demailclient\" =\r\ntarget=3D\"_blank\"><span =\r\nstyle=3D\'color:#4453EA\'>www.avast.com</span></a><o:p></o:p></span></p></t=\r\nd></tr></table><p =\r\nclass=3DMsoNormal><o:p>&nbsp;</o:p></p></div></div></body></html>\r\n------=_NextPart_001_0072_01DC51B9.BAE59540--\r\n\r\n------=_NextPart_000_0071_01DC51B9.BAE59540\r\nContent-Type: image/jpeg;\r\n	name=\"~WRD0480.jpg\"\r\nContent-Transfer-Encoding: base64\r\nContent-ID: <~WRD0480.jpg>\r\n\r\n/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a\r\nHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIy\r\nMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCABkAGQDASIA\r\nAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQA\r\nAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3\r\nODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWm\r\np6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEA\r\nAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSEx\r\nBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElK\r\nU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3\r\nuLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iii\r\ngAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKA\r\nCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK\r\nKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoo\r\nooAKKKKACiiigAooooAKKKKACiiigD//2Q==\r\n\r\n------=_NextPart_000_0071_01DC51B9.BAE59540--\r\n\r\n', 1, 0, NULL, NULL, '2025-11-09 20:11:43', '2025-11-09 19:45:41'),
(78, 28, 30031, 'mailer-daemon@vmi444375.contaboserver.net', 'Undelivered Mail Returned to Sender', '2025-11-10 20:46:34', '<20251110204634.959A36022F6@mail.aculeo.pl>', 'b8cd8c47dde33ef5029c18200039d78c06134a70', '40', NULL, NULL, 0, 1, 'unknown', 'Undelivered Mail Returned to Sender', NULL, '2025-11-10 20:47:32'),
(79, 27, 30031, 'mailer-daemon@vmi444375.contaboserver.net', 'Undelivered Mail Returned to Sender', '2025-11-10 20:46:34', '<20251110204634.966AA602302@mail.aculeo.pl>', '437d087374eb8aabee24610c3589380afb12084a', '41', NULL, NULL, 0, 1, 'unknown', 'Undelivered Mail Returned to Sender', NULL, '2025-11-10 20:47:43'),
(80, 27, 30029, 'czelen@verx.pl', 'RE: test', '2025-11-10 20:49:36', '<00fe01dc5283$85b72d00$91258700$@verx.pl>', '502c5574f5c189c6598142c4c82ced60afd61f5d', '42', '312312312312321\n\n\n\nFrom: sprzedaz@verx.pl <sprzedaz@verx.pl>\nSent: Monday, November 10, 2025 9:47 PM\nTo: czelen@verx.pl\nSubject: test\n\n\n\ndas asdas saf fasfgadfsdf asdf asd\n\n\n\nOtrzymałeś(-aś) tę wiadomość, ponieważ adres e-mail znajduje się w naszej bazie. Administratorem danych jest Verx Sp. z o.o (joeyki 52 11-123 warszawa). Jeśli nie chcesz otrzymywać od nas wiadomości, możesz się wypisać klikając  <https://mailing.aculeo.pl/unsubscribe/GNydufdgizcgRAbAw1G_AIsPP-m1IOZYPXmPqK5xxRE> tutaj.\n\n\n\n--', 'Return-Path: <czelen@verx.pl>\r\nDelivered-To: sprzedaz@verx.pl\r\nReceived: from mail.aculeo.pl\r\n	by aculeo.pl with LMTP\r\n	id cApvDuBPEmkK1gEAzMis/A\r\n	(envelope-from <czelen@verx.pl>)\r\n	for <sprzedaz@verx.pl>; Mon, 10 Nov 2025 21:49:36 +0100\r\nReceived: from DESKTOPR8FEKAU (unknown [45.149.209.134])\r\n	by mail.aculeo.pl (Postfix) with ESMTPSA id DAD4F601F40\r\n	for <sprzedaz@verx.pl>; Mon, 10 Nov 2025 21:49:34 +0100 (CET)\r\nDKIM-Signature: v=1; a=rsa-sha256; c=relaxed/simple; d=verx.pl; s=default;\r\n	t=1762807776; bh=ZKCMUFs0+EmBHi6E44gDisDzdUq8DMf2SyjoderQTMI=;\r\n	h=From:To:References:In-Reply-To:Subject:Date:From;\r\n	b=V0B8C8NcyxEA86S7RrhgDpk2gS/69GHQ2+CYMyCtVZjsH3VBkKgPUkQsQVnN25h7L\r\n	 WUBqW+YI73JbhQ4LaLaFIMP/ZqQpXnqe+fjNm4Zr+cnLkdp9BpWv/f0V0cx3rpzwW5\r\n	 ZV6lEuc69k3WBFrKy/eueZP5sYFRIXuRw2idafft1Gp8VrE64Qccidp++ht/hYvt64\r\n	 N3fzImtu4vmUoh9wnPWVMsnh2B4GyJTVY7WICx4fbsrNpiDXKxltl0TypJLEDUYGfl\r\n	 LkvcAS0zDJnENMN2ZvoxynCyBxD+wzV1/siL8iBP6l7nsVBX69Nowd2xjsh036rOdR\r\n	 FLwEN7JuMRFhQ==\r\nFrom: <czelen@verx.pl>\r\nTo: <sprzedaz@verx.pl>\r\nReferences: <1762807592592.vrztm1czlql@mail.yourcompany.com>\r\nIn-Reply-To: <1762807592592.vrztm1czlql@mail.yourcompany.com>\r\nSubject: RE: test\r\nDate: Mon, 10 Nov 2025 21:49:33 +0100\r\nMessage-ID: <00fe01dc5283$85b72d00$91258700$@verx.pl>\r\nMIME-Version: 1.0\r\nContent-Type: multipart/alternative;\r\n	boundary=\"----=_NextPart_000_00FF_01DC528B.E77E0600\"\r\nX-Mailer: Microsoft Outlook 16.0\r\nThread-Index: AQHyU/gK+mAXcY9ZGDFzWAkWzfi4ybTAXxPA\r\nContent-Language: pl\r\nX-Antivirus: Avast (VPS 251110-2, 10.11.2025), Outbound message\r\nX-Antivirus-Status: Clean\r\n\r\nThis is a multipart message in MIME format.\r\n\r\n------=_NextPart_000_00FF_01DC528B.E77E0600\r\nContent-Type: text/plain;\r\n	charset=\"utf-8\"\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n312312312312321\r\n\r\n \r\n\r\nFrom: sprzedaz@verx.pl <sprzedaz@verx.pl> \r\nSent: Monday, November 10, 2025 9:47 PM\r\nTo: czelen@verx.pl\r\nSubject: test\r\n\r\n \r\n\r\ndas asdas saf fasfgadfsdf asdf asd\r\n\r\n \r\n\r\nOtrzyma=C5=82e=C5=9B(-a=C5=9B) t=C4=99 wiadomo=C5=9B=C4=87, poniewa=C5=BC a=\r\ndres e-mail znajduje si=C4=99 w naszej bazie. Administratorem danych jest V=\r\nerx Sp. z o.o (joeyki 52 11-123 warszawa). Je=C5=9Bli nie chcesz otrzymywa=\r\n=C4=87 od nas wiadomo=C5=9Bci, mo=C5=BCesz si=C4=99 wypisa=C4=87 klikaj=C4=\r\n=85c  <https://mailing.aculeo.pl/unsubscribe/GNydufdgizcgRAbAw1G_AIsPP-m1IO=\r\nZYPXmPqK5xxRE> tutaj. \r\n\r\n\r\n\r\n-- \r\nTa wiadomo=C5=9B=C4=87 e-mail zosta=C5=82a sprawdzona pod k=C4=85tem wirus=\r\n=C3=B3w przez oprogramowanie antywirusowe Avast.\r\nwww.avast.com\r\n------=_NextPart_000_00FF_01DC528B.E77E0600\r\nContent-Type: text/html;\r\n	charset=\"utf-8\"\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n<html xmlns:o=3D\"urn:schemas-microsoft-com:office:office\" xmlns:w=3D\"urn:sc=\r\nhemas-microsoft-com:office:word\" xmlns:m=3D\"http://schemas.microsoft.com/of=\r\nfice/2004/12/omml\" xmlns=3D\"http://www.w3.org/TR/REC-html40\"><head><meta ht=\r\ntp-equiv=3DContent-Type content=3D\"text/html; charset=3Dutf-8\"><meta name=\r\n=3DGenerator content=3D\"Microsoft Word 15 (filtered medium)\"><style><!--\r\n/* Font Definitions */\r\n@font-face\r\n	{font-family:\"Cambria Math\";\r\n	panose-1:2 4 5 3 5 4 6 3 2 4;}\r\n@font-face\r\n	{font-family:Calibri;\r\n	panose-1:2 15 5 2 2 2 4 3 2 4;}\r\n@font-face\r\n	{font-family:Aptos;}\r\n/* Style Definitions */\r\np.MsoNormal, li.MsoNormal, div.MsoNormal\r\n	{margin:0cm;\r\n	font-size:12.0pt;\r\n	font-family:\"Aptos\",sans-serif;}\r\na:link, span.MsoHyperlink\r\n	{mso-style-priority:99;\r\n	color:blue;\r\n	text-decoration:underline;}\r\nspan.Stylwiadomocie-mail19\r\n	{mso-style-type:personal-reply;\r\n	font-family:\"Calibri\",sans-serif;\r\n	color:windowtext;}\r\n=2EMsoChpDefault\r\n	{mso-style-type:export-only;\r\n	font-size:11.0pt;\r\n	mso-fareast-language:EN-US;}\r\n@page WordSection1\r\n	{size:612.0pt 792.0pt;\r\n	margin:70.85pt 70.85pt 70.85pt 70.85pt;}\r\ndiv.WordSection1\r\n	{page:WordSection1;}\r\n--></style></head><body lang=3DPL link=3Dblue vlink=3Dpurple style=3D\'word-=\r\nwrap:break-word\'><div class=3DWordSection1><p class=3DMsoNormal><span style=\r\n=3D\'font-size:11.0pt;font-family:\"Calibri\",sans-serif;mso-fareast-language:=\r\nEN-US\'>312312312312321<o:p></o:p></span></p><p class=3DMsoNormal><span styl=\r\ne=3D\'font-size:11.0pt;font-family:\"Calibri\",sans-serif;mso-fareast-language=\r\n:EN-US\'><o:p>&nbsp;</o:p></span></p><div style=3D\'border:none;border-top:so=\r\nlid #E1E1E1 1.0pt;padding:3.0pt 0cm 0cm 0cm\'><p class=3DMsoNormal><b><span =\r\nstyle=3D\'font-size:11.0pt;font-family:\"Calibri\",sans-serif\'>From:</span></b=\r\n><span style=3D\'font-size:11.0pt;font-family:\"Calibri\",sans-serif\'> sprzeda=\r\nz@verx.pl &lt;sprzedaz@verx.pl&gt; <br><b>Sent:</b> Monday, November 10, 20=\r\n25 9:47 PM<br><b>To:</b> czelen@verx.pl<br><b>Subject:</b> test<o:p></o:p><=\r\n/span></p></div><p class=3DMsoNormal><o:p>&nbsp;</o:p></p><p>das asdas saf =\r\nfasfgadfsdf asdf asd<o:p></o:p></p><p>&nbsp;<o:p></o:p></p><div style=3D\'bo=\r\nrder:none;border-top:solid #EEEEEE 1.0pt;padding:9.0pt 0cm 0cm 0cm;margin-t=\r\nop:18.0pt\'><p class=3DMsoNormal align=3Dcenter style=3D\'text-align:center\'>=\r\n<span style=3D\'font-size:9.0pt;color:#666666\'>Otrzyma=C5=82e=C5=9B(-a=C5=9B=\r\n) t=C4=99 wiadomo=C5=9B=C4=87, poniewa=C5=BC adres e-mail znajduje si=C4=99=\r\n w naszej bazie. Administratorem danych jest Verx Sp. z o.o (joeyki 52 11-1=\r\n23 warszawa). Je=C5=9Bli nie chcesz otrzymywa=C4=87 od nas wiadomo=C5=9Bci,=\r\n mo=C5=BCesz si=C4=99 wypisa=C4=87 klikaj=C4=85c <a href=3D\"https://mailing=\r\n=2Eaculeo.pl/unsubscribe/GNydufdgizcgRAbAw1G_AIsPP-m1IOZYPXmPqK5xxRE\"><span=\r\n style=3D\'color:#666666\'>tutaj</span></a>. <o:p></o:p></span></p></div></di=\r\nv><div id=3D\"DAB4FAD8-2DD7-40BB-A1B8-4E2AA1F9FDF2\"><br /><table style=3D\"bo=\r\nrder-top: 1px solid #D3D4DE;\"><tr><td style=3D\"width: 55px; padding-top: 13=\r\npx;\"><a href=3D\"https://www.avast.com/sig-email?utm_medium=3Demail&utm_sour=\r\nce=3Dlink&utm_campaign=3Dsig-email&utm_content=3Demailclient\" target=3D\"_bl=\r\nank\"><img src=3D\"https://s-install.avcdn.net/ipm/preview/icons/icon-envelop=\r\ne-tick-round-orange-animated-no-repeat-v1.gif\" alt=3D\"\" width=3D\"46\" height=\r\n=3D\"29\" style=3D\"width: 46px; height: 29px;\"/></a></td><td style=3D\"width: =\r\n470px; padding-top: 12px; color: #41424e; font-size: 13px; font-family: Ari=\r\nal, Helvetica, sans-serif; line-height: 18px;\">Nie zawiera wirus=C3=B3w.<a =\r\nhref=3D\"https://www.avast.com/sig-email?utm_medium=3Demail&utm_source=3Dlin=\r\nk&utm_campaign=3Dsig-email&utm_content=3Demailclient\" target=3D\"_blank\" sty=\r\nle=3D\"color: #4453ea;\">www.avast.com</a></td></tr></table><a href=3D\"#DAB4F=\r\nAD8-2DD7-40BB-A1B8-4E2AA1F9FDF2\" width=3D\"1\" height=3D\"1\"> </a></div></body=\r\n></html>\r\n------=_NextPart_000_00FF_01DC528B.E77E0600--\r\n\r\n', 1, 0, NULL, NULL, '2025-11-10 20:51:52', '2025-11-10 20:50:33'),
(81, 28, 30029, 'czelen@verx.pl', 'RE: wielka promocja', '2025-11-10 20:49:43', '<010301dc5283$89dfc810$9d9f5830$@verx.pl>', 'dafcb955447ea0eb68ea770c557b4b7182f329e4', '43', 'sdasdasdasdas\n\n\n\nFrom: sprzedaz@verx.pl <sprzedaz@verx.pl>\nSent: Monday, November 10, 2025 9:47 PM\nTo: czelen@verx.pl\nSubject: wielka promocja\n\n\n\nTa wiadomość została wysłana do Ciebie, ponieważ wyraziłeś zgodę na otrzymywanie informacji marketingowych.\n\nZgodnie z RODO, informujemy że:\n\n*	Administratorem Twoich danych osobowych jest sprzedaz@verx.pl <mailto:sprzedaz@verx.pl>\n*	Twoje dane są przetwarzane w celu prowadzenia marketingu bezpośredniego\n*	Masz prawo do wycofania zgody w dowolnym momen', 'Return-Path: <czelen@verx.pl>\r\nDelivered-To: sprzedaz@verx.pl\r\nReceived: from mail.aculeo.pl\r\n	by aculeo.pl with LMTP\r\n	id EFtcC+dPEmkK1gEAzMis/A\r\n	(envelope-from <czelen@verx.pl>)\r\n	for <sprzedaz@verx.pl>; Mon, 10 Nov 2025 21:49:43 +0100\r\nReceived: from DESKTOPR8FEKAU (unknown [45.149.209.134])\r\n	by mail.aculeo.pl (Postfix) with ESMTPSA id F3A75601F40\r\n	for <sprzedaz@verx.pl>; Mon, 10 Nov 2025 21:49:41 +0100 (CET)\r\nDKIM-Signature: v=1; a=rsa-sha256; c=relaxed/simple; d=verx.pl; s=default;\r\n	t=1762807783; bh=Va/hh0mYaBYZDcAcfB6RtO056oDyyKhV9aNtIz4at/8=;\r\n	h=From:To:References:In-Reply-To:Subject:Date:From;\r\n	b=p0K9bcMtVMO+0Ly5e0nzC2D+ltN0Ay8JgQleVWvcEWfE72htxw6L558aHvAC0WmB0\r\n	 KNVc6V0UQHvlNTZ+gvFxr5vE2UtOgqYlXkJMTtWbKhwuCPKY3+lnu5jECghiOujikH\r\n	 Fskm1ZTKeC5zIB34h4Q1hPQQiMo0hmPzZ7BooSqqQqFD66owQmOcfsmCnZZAvXFdxS\r\n	 158oR5xdmKj01fKZ3gzdHULPFDQsCtDjIZbNLOQ7zr7NT62NrqlCNe41o15AJVWpWN\r\n	 dnfjsIl8PRZG/m4OO2epXZ7JVQk3enNavtYgn5UBevow5XJ7+pwchuKj0eO0XH/Odv\r\n	 3oBAI9Ns2asSA==\r\nFrom: <czelen@verx.pl>\r\nTo: <sprzedaz@verx.pl>\r\nReferences: <1762807592819.0qta0090zmvo@mail.yourcompany.com>\r\nIn-Reply-To: <1762807592819.0qta0090zmvo@mail.yourcompany.com>\r\nSubject: RE: wielka promocja\r\nDate: Mon, 10 Nov 2025 21:49:40 +0100\r\nMessage-ID: <010301dc5283$89dfc810$9d9f5830$@verx.pl>\r\nMIME-Version: 1.0\r\nContent-Type: multipart/alternative;\r\n	boundary=\"----=_NextPart_000_0104_01DC528B.EBA43010\"\r\nX-Mailer: Microsoft Outlook 16.0\r\nThread-Index: AQInSib/v4hh4hOiKD33yKychOjXorRWcr2g\r\nContent-Language: pl\r\nX-Antivirus: Avast (VPS 251110-2, 10.11.2025), Outbound message\r\nX-Antivirus-Status: Clean\r\n\r\nThis is a multipart message in MIME format.\r\n\r\n------=_NextPart_000_0104_01DC528B.EBA43010\r\nContent-Type: text/plain;\r\n	charset=\"utf-8\"\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\nsdasdasdasdas\r\n\r\n \r\n\r\nFrom: sprzedaz@verx.pl <sprzedaz@verx.pl> \r\nSent: Monday, November 10, 2025 9:47 PM\r\nTo: czelen@verx.pl\r\nSubject: wielka promocja\r\n\r\n \r\n\r\nTa wiadomo=C5=9B=C4=87 zosta=C5=82a wys=C5=82ana do Ciebie, poniewa=C5=BC w=\r\nyrazi=C5=82e=C5=9B zgod=C4=99 na otrzymywanie informacji marketingowych.\r\n\r\nZgodnie z RODO, informujemy =C5=BCe:\r\n\r\n*	Administratorem Twoich danych osobowych jest sprzedaz@verx.pl <mailto:spr=\r\nzedaz@verx.pl> \r\n*	Twoje dane s=C4=85 przetwarzane w celu prowadzenia marketingu bezpo=C5=9B=\r\nredniego\r\n*	Masz prawo do wycofania zgody w dowolnym momencie\r\n*	Masz prawo dost=C4=99pu, sprostowania, usuni=C4=99cia lub ograniczenia pr=\r\nzetwarzania swoich danych\r\n\r\n <https://mailing.aculeo.pl/unsubscribe/GNydufdgizcgRAbAw1G_AIsPP-m1IOZYPXm=\r\nPqK5xxRE> Wypisz si=C4=99 z listy mailingowej \r\n\r\nsprzedaz@verx.pl <mailto:sprzedaz@verx.pl>  | sprzedaz@verx.pl <mailto:sprz=\r\nedaz@verx.pl>  \r\n\r\n\r\n\r\n-- \r\nTa wiadomo=C5=9B=C4=87 e-mail zosta=C5=82a sprawdzona pod k=C4=85tem wirus=\r\n=C3=B3w przez oprogramowanie antywirusowe Avast.\r\nwww.avast.com\r\n------=_NextPart_000_0104_01DC528B.EBA43010\r\nContent-Type: text/html;\r\n	charset=\"utf-8\"\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n<html xmlns:o=3D\"urn:schemas-microsoft-com:office:office\" xmlns:w=3D\"urn:sc=\r\nhemas-microsoft-com:office:word\" xmlns:m=3D\"http://schemas.microsoft.com/of=\r\nfice/2004/12/omml\" xmlns=3D\"http://www.w3.org/TR/REC-html40\"><head><meta ht=\r\ntp-equiv=3DContent-Type content=3D\"text/html; charset=3Dutf-8\"><meta name=\r\n=3DGenerator content=3D\"Microsoft Word 15 (filtered medium)\"><style><!--\r\n/* Font Definitions */\r\n@font-face\r\n	{font-family:Wingdings;\r\n	panose-1:5 0 0 0 0 0 0 0 0 0;}\r\n@font-face\r\n	{font-family:\"Cambria Math\";\r\n	panose-1:2 4 5 3 5 4 6 3 2 4;}\r\n@font-face\r\n	{font-family:Calibri;\r\n	panose-1:2 15 5 2 2 2 4 3 2 4;}\r\n@font-face\r\n	{font-family:Aptos;}\r\n/* Style Definitions */\r\np.MsoNormal, li.MsoNormal, div.MsoNormal\r\n	{margin:0cm;\r\n	font-size:12.0pt;\r\n	font-family:\"Aptos\",sans-serif;}\r\na:link, span.MsoHyperlink\r\n	{mso-style-priority:99;\r\n	color:blue;\r\n	text-decoration:underline;}\r\nspan.Stylwiadomocie-mail20\r\n	{mso-style-type:personal-reply;\r\n	font-family:\"Calibri\",sans-serif;\r\n	color:windowtext;}\r\n=2EMsoChpDefault\r\n	{mso-style-type:export-only;\r\n	font-size:11.0pt;\r\n	mso-fareast-language:EN-US;}\r\n@page WordSection1\r\n	{size:612.0pt 792.0pt;\r\n	margin:70.85pt 70.85pt 70.85pt 70.85pt;}\r\ndiv.WordSection1\r\n	{page:WordSection1;}\r\n/* List Definitions */\r\n@list l0\r\n	{mso-list-id:374356801;\r\n	mso-list-template-ids:-792283824;}\r\n@list l0:level1\r\n	{mso-level-number-format:bullet;\r\n	mso-level-text:=EF=82=B7;\r\n	mso-level-tab-stop:36.0pt;\r\n	mso-level-number-position:left;\r\n	text-indent:-18.0pt;\r\n	mso-ansi-font-size:10.0pt;\r\n	font-family:Symbol;}\r\n@list l0:level2\r\n	{mso-level-number-format:bullet;\r\n	mso-level-text:o;\r\n	mso-level-tab-stop:72.0pt;\r\n	mso-level-number-position:left;\r\n	text-indent:-18.0pt;\r\n	mso-ansi-font-size:10.0pt;\r\n	font-family:\"Courier New\";\r\n	mso-bidi-font-family:\"Times New Roman\";}\r\n@list l0:level3\r\n	{mso-level-number-format:bullet;\r\n	mso-level-text:=EF=82=A7;\r\n	mso-level-tab-stop:108.0pt;\r\n	mso-level-number-position:left;\r\n	text-indent:-18.0pt;\r\n	mso-ansi-font-size:10.0pt;\r\n	font-family:Wingdings;}\r\n@list l0:level4\r\n	{mso-level-number-format:bullet;\r\n	mso-level-text:=EF=82=A7;\r\n	mso-level-tab-stop:144.0pt;\r\n	mso-level-number-position:left;\r\n	text-indent:-18.0pt;\r\n	mso-ansi-font-size:10.0pt;\r\n	font-family:Wingdings;}\r\n@list l0:level5\r\n	{mso-level-number-format:bullet;\r\n	mso-level-text:=EF=82=A7;\r\n	mso-level-tab-stop:180.0pt;\r\n	mso-level-number-position:left;\r\n	text-indent:-18.0pt;\r\n	mso-ansi-font-size:10.0pt;\r\n	font-family:Wingdings;}\r\n@list l0:level6\r\n	{mso-level-number-format:bullet;\r\n	mso-level-text:=EF=82=A7;\r\n	mso-level-tab-stop:216.0pt;\r\n	mso-level-number-position:left;\r\n	text-indent:-18.0pt;\r\n	mso-ansi-font-size:10.0pt;\r\n	font-family:Wingdings;}\r\n@list l0:level7\r\n	{mso-level-number-format:bullet;\r\n	mso-level-text:=EF=82=A7;\r\n	mso-level-tab-stop:252.0pt;\r\n	mso-level-number-position:left;\r\n	text-indent:-18.0pt;\r\n	mso-ansi-font-size:10.0pt;\r\n	font-family:Wingdings;}\r\n@list l0:level8\r\n	{mso-level-number-format:bullet;\r\n	mso-level-text:=EF=82=A7;\r\n	mso-level-tab-stop:288.0pt;\r\n	mso-level-number-position:left;\r\n	text-indent:-18.0pt;\r\n	mso-ansi-font-size:10.0pt;\r\n	font-family:Wingdings;}\r\n@list l0:level9\r\n	{mso-level-number-format:bullet;\r\n	mso-level-text:=EF=82=A7;\r\n	mso-level-tab-stop:324.0pt;\r\n	mso-level-number-position:left;\r\n	text-indent:-18.0pt;\r\n	mso-ansi-font-size:10.0pt;\r\n	font-family:Wingdings;}\r\nol\r\n	{margin-bottom:0cm;}\r\nul\r\n	{margin-bottom:0cm;}\r\n--></style></head><body lang=3DPL link=3Dblue vlink=3Dpurple style=3D\'word-=\r\nwrap:break-word\'><div class=3DWordSection1><p class=3DMsoNormal><span style=\r\n=3D\'font-size:11.0pt;font-family:\"Calibri\",sans-serif;mso-fareast-language:=\r\nEN-US\'>sdasdasdasdas<o:p></o:p></span></p><p class=3DMsoNormal><span style=\r\n=3D\'font-size:11.0pt;font-family:\"Calibri\",sans-serif;mso-fareast-language:=\r\nEN-US\'><o:p>&nbsp;</o:p></span></p><div style=3D\'border:none;border-top:sol=\r\nid #E1E1E1 1.0pt;padding:3.0pt 0cm 0cm 0cm\'><p class=3DMsoNormal><b><span s=\r\ntyle=3D\'font-size:11.0pt;font-family:\"Calibri\",sans-serif\'>From:</span></b>=\r\n<span style=3D\'font-size:11.0pt;font-family:\"Calibri\",sans-serif\'> sprzedaz=\r\n@verx.pl &lt;sprzedaz@verx.pl&gt; <br><b>Sent:</b> Monday, November 10, 202=\r\n5 9:47 PM<br><b>To:</b> czelen@verx.pl<br><b>Subject:</b> wielka promocja<o=\r\n:p></o:p></span></p></div><p class=3DMsoNormal><o:p>&nbsp;</o:p></p><div st=\r\nyle=3D\'border:none;border-top:solid #E0E0E0 1.0pt;padding:15.0pt 0cm 0cm 0c=\r\nm;margin-top:30.0pt\'><p align=3Dcenter style=3D\'text-align:center\'><span st=\r\nyle=3D\'font-size:9.0pt;color:#666666\'>Ta wiadomo=C5=9B=C4=87 zosta=C5=82a w=\r\nys=C5=82ana do Ciebie, poniewa=C5=BC wyrazi=C5=82e=C5=9B zgod=C4=99 na otrz=\r\nymywanie informacji marketingowych.<o:p></o:p></span></p><p align=3Dcenter =\r\nstyle=3D\'text-align:center\'><span style=3D\'font-size:9.0pt;color:#666666\'>Z=\r\ngodnie z RODO, informujemy =C5=BCe:<o:p></o:p></span></p><ul type=3Ddisc><l=\r\ni class=3DMsoNormal style=3D\'color:#666666;mso-margin-top-alt:auto;mso-marg=\r\nin-bottom-alt:auto;mso-list:l0 level1 lfo1\'><span style=3D\'font-size:9.0pt\'=\r\n>Administratorem Twoich danych osobowych jest <a href=3D\"mailto:sprzedaz@ve=\r\nrx.pl\">sprzedaz@verx.pl</a><o:p></o:p></span></li><li class=3DMsoNormal sty=\r\nle=3D\'color:#666666;mso-margin-top-alt:auto;mso-margin-bottom-alt:auto;mso-=\r\nlist:l0 level1 lfo1\'><span style=3D\'font-size:9.0pt\'>Twoje dane s=C4=85 prz=\r\netwarzane w celu prowadzenia marketingu bezpo=C5=9Bredniego<o:p></o:p></spa=\r\nn></li><li class=3DMsoNormal style=3D\'color:#666666;mso-margin-top-alt:auto=\r\n;mso-margin-bottom-alt:auto;mso-list:l0 level1 lfo1\'><span style=3D\'font-si=\r\nze:9.0pt\'>Masz prawo do wycofania zgody w dowolnym momencie<o:p></o:p></spa=\r\nn></li><li class=3DMsoNormal style=3D\'color:#666666;mso-margin-top-alt:auto=\r\n;mso-margin-bottom-alt:auto;mso-list:l0 level1 lfo1\'><span style=3D\'font-si=\r\nze:9.0pt\'>Masz prawo dost=C4=99pu, sprostowania, usuni=C4=99cia lub ogranic=\r\nzenia przetwarzania swoich danych<o:p></o:p></span></li></ul><p align=3Dcen=\r\nter style=3D\'text-align:center\'><span style=3D\'font-size:9.0pt;color:#66666=\r\n6\'><a href=3D\"https://mailing.aculeo.pl/unsubscribe/GNydufdgizcgRAbAw1G_AIs=\r\nPP-m1IOZYPXmPqK5xxRE\"><span style=3D\'color:#007BFF\'>Wypisz si=C4=99 z listy=\r\n mailingowej </span></a><o:p></o:p></span></p><p align=3Dcenter style=3D\'ma=\r\nrgin-top:11.25pt;text-align:center\'><span style=3D\'font-size:8.5pt;color:#9=\r\n99999\'><a href=3D\"mailto:sprzedaz@verx.pl\">sprzedaz@verx.pl</a> | <a href=\r\n=3D\"mailto:sprzedaz@verx.pl\">sprzedaz@verx.pl</a> <o:p></o:p></span></p></d=\r\niv></div><div id=3D\"DAB4FAD8-2DD7-40BB-A1B8-4E2AA1F9FDF2\"><br /><table styl=\r\ne=3D\"border-top: 1px solid #D3D4DE;\"><tr><td style=3D\"width: 55px; padding-=\r\ntop: 13px;\"><a href=3D\"https://www.avast.com/sig-email?utm_medium=3Demail&u=\r\ntm_source=3Dlink&utm_campaign=3Dsig-email&utm_content=3Demailclient\" target=\r\n=3D\"_blank\"><img src=3D\"https://s-install.avcdn.net/ipm/preview/icons/icon-=\r\nenvelope-tick-round-orange-animated-no-repeat-v1.gif\" alt=3D\"\" width=3D\"46\"=\r\n height=3D\"29\" style=3D\"width: 46px; height: 29px;\"/></a></td><td style=3D\"=\r\nwidth: 470px; padding-top: 12px; color: #41424e; font-size: 13px; font-fami=\r\nly: Arial, Helvetica, sans-serif; line-height: 18px;\">Nie zawiera wirus=C3=\r\n=B3w.<a href=3D\"https://www.avast.com/sig-email?utm_medium=3Demail&utm_sour=\r\nce=3Dlink&utm_campaign=3Dsig-email&utm_content=3Demailclient\" target=3D\"_bl=\r\nank\" style=3D\"color: #4453ea;\">www.avast.com</a></td></tr></table><a href=\r\n=3D\"#DAB4FAD8-2DD7-40BB-A1B8-4E2AA1F9FDF2\" width=3D\"1\" height=3D\"1\"> </a></=\r\ndiv></body></html>\r\n------=_NextPart_000_0104_01DC528B.EBA43010--\r\n\r\n', 1, 0, NULL, NULL, '2025-11-10 20:52:21', '2025-11-10 20:50:33'),
(82, 27, 30031, 'mailer-daemon@vmi444375.contaboserver.net', 'Undelivered Mail Returned to Sender', '2025-11-12 20:39:22', '<20251112203922.8DA066022EE@mail.aculeo.pl>', '4546fc0b9367de6852ea07a80613c445eac7ae54', '44', NULL, NULL, 0, 1, 'unknown', 'Undelivered Mail Returned to Sender', NULL, '2025-11-12 20:42:26'),
(83, 27, 30031, 'mailer-daemon@vmi444375.contaboserver.net', 'Undelivered Mail Returned to Sender', '2025-11-12 20:49:20', '<20251112204920.EC9796022EE@mail.aculeo.pl>', 'de0106301bc09ce634d08706cbaeee2b9704fb1b', '45', NULL, NULL, 0, 1, 'unknown', 'Undelivered Mail Returned to Sender', NULL, '2025-11-12 20:52:20'),
(84, 27, 30029, 'czelen@verx.pl', 'RE: test', '2025-12-03 20:04:14', '<03c801dc648f$ff970320$fec50960$@verx.pl>', '2ee27f892dc6093885df8f193d9b80d92695864e', '46', NULL, NULL, 0, 0, NULL, NULL, NULL, '2025-12-03 20:08:43'),
(85, 27, 30031, 'mailer-daemon@vmi444375.contaboserver.net', 'Undelivered Mail Returned to Sender', '2025-12-03 20:16:58', '<20251203201658.2F3BB6022EE@mail.aculeo.pl>', '4a958e53416f18ed4ff189f4d9e26dbc146cd9d7', '47', NULL, NULL, 0, 1, 'unknown', 'Undelivered Mail Returned to Sender', NULL, '2025-12-03 20:18:43');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `smtp_host` varchar(255) DEFAULT NULL,
  `smtp_port` int(11) DEFAULT NULL,
  `smtp_user` varchar(255) DEFAULT NULL,
  `smtp_pass` varchar(255) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `company_address_line_1` varchar(255) DEFAULT NULL,
  `company_address_line_2` varchar(255) DEFAULT NULL,
  `company_address_city` varchar(255) DEFAULT NULL,
  `company_address_postal_code` varchar(255) DEFAULT NULL,
  `smtp_from` varchar(255) DEFAULT NULL,
  `rodo_footer` text DEFAULT NULL,
  `use_internal_mail_server` int(11) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `smtp_secure` tinyint(4) DEFAULT NULL,
  `smtp_allow_self_signed` tinyint(4) DEFAULT NULL,
  `reply_check_enabled` tinyint(4) DEFAULT NULL,
  `reply_mailbox_host` varchar(300) DEFAULT NULL,
  `reply_mailbox_port` int(11) DEFAULT NULL,
  `reply_mailbox_user` varchar(200) DEFAULT NULL,
  `reply_mailbox_pass` varchar(200) DEFAULT NULL,
  `reply_mailbox_protocol` varchar(200) DEFAULT NULL,
  `reply_mailbox_folder` varchar(200) DEFAULT NULL,
  `reply_mailbox_tls` tinyint(4) DEFAULT NULL,
  `reply_mailbox_allow_self_signed` tinyint(4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Zrzut danych tabeli `customers`
--

INSERT INTO `customers` (`id`, `name`, `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass`, `company_name`, `company_address_line_1`, `company_address_line_2`, `company_address_city`, `company_address_postal_code`, `smtp_from`, `rodo_footer`, `use_internal_mail_server`, `active`, `smtp_secure`, `smtp_allow_self_signed`, `reply_check_enabled`, `reply_mailbox_host`, `reply_mailbox_port`, `reply_mailbox_user`, `reply_mailbox_pass`, `reply_mailbox_protocol`, `reply_mailbox_folder`, `reply_mailbox_tls`, `reply_mailbox_allow_self_signed`) VALUES
(1, 'verx', 'mail.aculeo.pl', 465, 'verx@nowoczesnaszkola20.pl', 'nyqKDEQBkPt', 'Verx Sp. z o.o', 'ul. Joteyki 13/52', '', 'Warszawa', '02-317', 'verx@nowoczesnaszkola20.pl', 'Zgodnie z RODO, informujemy, że:\nAdministrator danych: {{COMPANY_NAME}}\nAdres: {{COMPANY_ADDRESS}}\nPrzetwarzamy Państwa dane osobowe w celu prowadzenia działań marketingowych.\nW przypadku pytań dotyczących przetwarzania danych osobowych, prosimy o kontakt.\n {{UNSUBSCRIBE_LINK}}', 0, 1, 1, 1, 1, 'mail.aculeo.pl', 993, 'verx@nowoczesnaszkola20.pl', 'nyqKDEQBkPt', 'imap', 'INBOX', 1, 1);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `customer_databases`
--

CREATE TABLE `customer_databases` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `rodo_flag` int(11) DEFAULT NULL,
  `export_enabled` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Zrzut danych tabeli `customer_databases`
--

INSERT INTO `customer_databases` (`id`, `customer_id`, `name`, `description`, `tags`, `rodo_flag`, `export_enabled`, `created_at`, `updated_at`, `deleted_at`) VALUES
(17, 1, 'test', '', '[]', 1, 1, '2025-11-05 18:38:35', '2025-11-08 14:30:13', '2025-11-08 14:30:12'),
(18, 1, 'qqqq', '', '[\"123\"]', 1, 1, '2025-11-05 21:00:48', '2025-11-16 15:26:01', '2025-11-16 15:26:01'),
(19, 1, 'test', 'werwe', '[\"2222\",\"ssss\"]', 1, 0, '2025-11-08 14:46:45', '2025-11-08 15:16:56', '2025-11-08 15:16:56'),
(20, 1, 'wqeqwe', 'eqweq', '[\"2222\"]', 1, 0, '2025-11-08 15:21:33', '2025-11-08 16:39:57', '2025-11-08 16:39:57'),
(21, 1, 'test', 'wer', '[\"qweqw\",\"qwe\"]', 1, 0, '2025-11-08 16:40:22', '2025-11-08 16:40:22', NULL),
(22, 1, 'Test Bartek', '', '[]', 1, 1, '2025-12-02 19:37:35', '2025-12-02 19:37:35', NULL);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `email_templates`
--

CREATE TABLE `email_templates` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) NOT NULL DEFAULT 'Inne',
  `thumbnail` text DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `author` varchar(255) DEFAULT 'System',
  `version` varchar(50) NOT NULL DEFAULT '1.0',
  `isSystem` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Czy template jest systemowy (nie można usunąć)',
  `isPublic` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Czy template jest dostępny dla wszystkich użytkowników',
  `customerId` int(11) DEFAULT NULL COMMENT 'ID klienta - null dla globalnych templateów',
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Dodatkowe informacje o template (rozmiar, kolory dominujące, etc.)',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `deletedAt` datetime DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `usageCount` int(11) NOT NULL DEFAULT 0 COMMENT 'Ile razy template był użyty',
  `lastUsedAt` datetime DEFAULT NULL COMMENT 'Kiedy template był ostatnio użyty'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela szablonów email';

--
-- Zrzut danych tabeli `email_templates`
--

INSERT INTO `email_templates` (`id`, `name`, `description`, `category`, `thumbnail`, `tags`, `author`, `version`, `isSystem`, `isPublic`, `customerId`, `metadata`, `createdAt`, `updatedAt`, `deletedAt`, `isActive`, `usageCount`, `lastUsedAt`) VALUES
(1, 'Newsletter Firmowy', 'Profesjonalny szablon newslettera z logo, nagłówkiem i stopką', 'newsletter', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjMjE5NkYzIi8+PHJlY3QgeD0iMTAiIHk9IjUwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZTBlMGUwIi8+PHJlY3QgeD0iMTAiIHk9IjgwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZTBlMGUwIi8+PHJlY3QgeD0iMTAiIHk9IjExMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjNGNhZjUwIi8+PC9zdmc+', '[\"newsletter\", \"firmowy\", \"miesięczny\"]', 'System', '1.0', 1, 1, NULL, '{\"blocks\": 8, \"primaryColors\": [\"#2196F3\", \"#3498db\", \"#4caf50\"], \"estimatedHeight\": 600}', '2025-10-31 20:00:42', '2025-10-31 23:04:00', NULL, 1, 5, '2025-10-31 23:04:00'),
(2, 'Promocja - Wielka Wyprzedaż', 'Atrakcyjny szablon promocyjny z dużym rabatem i call-to-action', 'promocja', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlNzRjM2M7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojYzM0MzMzO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiLz48dGV4dCB4PSIxMDAiIHk9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiPi01MCU8L3RleHQ+PHJlY3QgeD0iNTAiIHk9IjYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjZmZmIiByeD0iNSIvPjx0ZXh0IHg9IjEwMCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNlNzRjM2MiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIj5LVVAgVEVSQVo8L3RleHQ+PC9zdmc+', '[\"promocja\", \"wyprzedaż\", \"rabat\", \"ecommerce\"]', 'System', '1.0', 1, 1, NULL, '{\"blocks\": 6, \"primaryColors\": [\"#e74c3c\", \"#c34333\", \"#ffffff\"], \"estimatedHeight\": 500}', '2025-10-31 20:00:42', '2025-11-01 16:30:12', NULL, 1, 2, '2025-11-01 16:30:12'),
(3, 'Powiadomienie - Powitanie', 'Szablon powitalny dla nowych użytkowników lub klientów', 'powiadomienie', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWNmMGYxIi8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iNDAiIHI9IjI1IiBmaWxsPSIjMjdhZTYwIi8+PHRleHQgeD0iMTAwIiB5PSI0NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMjAiPuKckTwvdGV4dD48dGV4dCB4PSIxMDAiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMmMzZTUwIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+V2l0YWo8L3RleHQ+PHRleHQgeD0iMTAwIiB5PSIxMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM3ZjhjOGQiIGZvbnQtc2l6ZT0iMTAiPkRaw65rdWplbXkgemEgcmVqZXN0cmFjasW5PC90ZXh0PjxyZWN0IHg9IjcwIiB5PSIxMTUiIHdpZHRoPSI2MCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzM0OThkYiIgcng9IjMiLz48dGV4dCB4PSIxMDAiIHk9IjEyOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iOSI+UG9jemF0ZWs8L3RleHQ+PC9zdmc+', '[\"powitanie\", \"rejestracja\", \"welcome\", \"onboarding\"]', 'System', '1.0', 1, 1, NULL, '{\"blocks\": 5, \"primaryColors\": [\"#27ae60\", \"#3498db\", \"#2c3e50\"], \"estimatedHeight\": 400}', '2025-10-31 20:00:42', '2025-11-02 19:28:35', NULL, 1, 1, '2025-11-02 19:28:35'),
(4, 'Testowy Newsletter', 'Przykładowy szablon newslettera do testowania migracji', 'newsletter', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiLz4KICAgIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzIxOTZGMyIgcng9IjQiLz4KICAgIDx0ZXh0IHg9IjEwMCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgZm9udC13ZWlnaHQ9ImJvbGQiPgogICAgICBUZXN0b3d5IE5ld3NsZXR0ZXIKICAgIDwvdGV4dD4KICAgIDx0ZXh0IHg9IjEwMCIgeT0iNzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzY2NjY2NiI+CiAgICAgIDMgYmxvayjDs3cpCiAgICA8L3RleHQ+CiAgICA8dGV4dCB4PSIxMDAiIHk9Ijk1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOSIgZmlsbD0iIzY2NjY2NiI+CiAgICAgIG5ld3NsZXR0ZXIKICAgIDwvdGV4dD4KICA8L3N2Zz4=', '[\"test\", \"newsletter\", \"przykład\"]', 'Tester', '1.0', 1, 1, NULL, '{\"blocks\": 3, \"migratedFrom\": \"legacy-json\", \"migrationDate\": \"2025-10-31T20:54:52.532Z\", \"estimatedHeight\": 180}', '2025-10-31 20:54:52', '2025-10-31 22:44:15', NULL, 1, 1, '2025-10-31 22:44:15'),
(5, 'Oferta dla szkół i uczelni', 'Profesjonalny szablon mailingowy promujący produkty i rozwiązania dla edukacji', 'Inne', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiLz4KICAgIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzYwN2Q4YiIgcng9IjQiLz4KICAgIDx0ZXh0IHg9IjEwMCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgZm9udC13ZWlnaHQ9ImJvbGQiPgogICAgICBPZmVydGEgZGxhIHN6a8OzxYIgaSB1Y3plbG5pCiAgICA8L3RleHQ+CiAgICA8dGV4dCB4PSIxMDAiIHk9Ijc1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2NjY2NjYiPgogICAgICA3IGJsb2sow7N3KQogICAgPC90ZXh0PgogICAgPHRleHQgeD0iMTAwIiB5PSI5NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjkiIGZpbGw9IiM2NjY2NjYiPgogICAgICBJbm5lCiAgICA8L3RleHQ+CiAgPC9zdmc+', '[]', 'Migracja', '1.0', 1, 1, NULL, '{\"blocks\": 7, \"migratedFrom\": \"legacy-json\", \"migrationDate\": \"2025-10-31T20:55:17.940Z\", \"estimatedHeight\": 420}', '2025-10-31 20:55:17', '2025-10-31 20:55:17', NULL, 1, 0, NULL),
(6, 'Zaproszenie na Wydarzenie', 'Elegancki szablon zaproszenia na konferencję, webinar lub spotkanie', 'wydarzenia', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiLz4KICAgIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzljMjdiMCIgcng9IjQiLz4KICAgIDx0ZXh0IHg9IjEwMCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgZm9udC13ZWlnaHQ9ImJvbGQiPgogICAgICBaYXByb3N6ZW5pZSBuYSBXeWRhcnplbmllCiAgICA8L3RleHQ+CiAgICA8dGV4dCB4PSIxMDAiIHk9Ijc1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2NjY2NjYiPgogICAgICAxMCBibG9rKMOzdykKICAgIDwvdGV4dD4KICAgIDx0ZXh0IHg9IjEwMCIgeT0iOTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI5IiBmaWxsPSIjNjY2NjY2Ij4KICAgICAgd3lkYXJ6ZW5pYQogICAgPC90ZXh0PgogIDwvc3ZnPg==', '[]', 'Migracja', '1.0', 1, 1, NULL, '{\"blocks\": 10, \"migratedFrom\": \"legacy-json\", \"migrationDate\": \"2025-10-31T20:55:17.942Z\", \"estimatedHeight\": 600}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', NULL, 1, 0, NULL),
(7, 'Oferta dla liceów i techników', 'Szablon promujący projektory interaktywne dla liceów i techników', 'Inne', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiLz4KICAgIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzYwN2Q4YiIgcng9IjQiLz4KICAgIDx0ZXh0IHg9IjEwMCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgZm9udC13ZWlnaHQ9ImJvbGQiPgogICAgICBPZmVydGEgZGxhIGxpY2XDs3cgaSB0ZWNobmlrw7N3CiAgICA8L3RleHQ+CiAgICA8dGV4dCB4PSIxMDAiIHk9Ijc1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2NjY2NjYiPgogICAgICA1IGJsb2sow7N3KQogICAgPC90ZXh0PgogICAgPHRleHQgeD0iMTAwIiB5PSI5NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjkiIGZpbGw9IiM2NjY2NjYiPgogICAgICBJbm5lCiAgICA8L3RleHQ+CiAgPC9zdmc+', '[]', 'Migracja', '1.0', 1, 1, NULL, '{\"blocks\": 5, \"migratedFrom\": \"legacy-json\", \"migrationDate\": \"2025-10-31T20:55:17.943Z\", \"estimatedHeight\": 300}', '2025-10-31 20:55:18', '2025-11-03 16:41:04', NULL, 1, 9, '2025-11-03 16:41:04'),
(8, 'Szablon index', 'Szablon zmigrowany z starego systemu', 'Inne', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiLz4KICAgIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzYwN2Q4YiIgcng9IjQiLz4KICAgIDx0ZXh0IHg9IjEwMCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgZm9udC13ZWlnaHQ9ImJvbGQiPgogICAgICBTemFibG9uIGluZGV4CiAgICA8L3RleHQ+CiAgICA8dGV4dCB4PSIxMDAiIHk9Ijc1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2NjY2NjYiPgogICAgICAxMCBibG9rKMOzdykKICAgIDwvdGV4dD4KICAgIDx0ZXh0IHg9IjEwMCIgeT0iOTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI5IiBmaWxsPSIjNjY2NjY2Ij4KICAgICAgSW5uZQogICAgPC90ZXh0PgogIDwvc3ZnPg==', '[]', 'Migracja', '1.0', 1, 1, NULL, '{\"blocks\": 10, \"migratedFrom\": \"legacy-json\", \"migrationDate\": \"2025-10-31T20:55:17.943Z\", \"estimatedHeight\": 600}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', NULL, 1, 0, NULL),
(9, 'Oferta dla przedszkoli', 'Kolorowy szablon promujący wyposażenie i pomoce dydaktyczne dla przedszkoli', 'Inne', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiLz4KICAgIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzYwN2Q4YiIgcng9IjQiLz4KICAgIDx0ZXh0IHg9IjEwMCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgZm9udC13ZWlnaHQ9ImJvbGQiPgogICAgICBPZmVydGEgZGxhIHByemVkc3prb2xpCiAgICA8L3RleHQ+CiAgICA8dGV4dCB4PSIxMDAiIHk9Ijc1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2NjY2NjYiPgogICAgICA2IGJsb2sow7N3KQogICAgPC90ZXh0PgogICAgPHRleHQgeD0iMTAwIiB5PSI5NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjkiIGZpbGw9IiM2NjY2NjYiPgogICAgICBJbm5lCiAgICA8L3RleHQ+CiAgPC9zdmc+', '[]', 'Migracja', '1.0', 0, 0, NULL, '{\"blocks\": 6, \"migratedFrom\": \"legacy-json\", \"migrationDate\": \"2025-10-31T20:55:17.944Z\", \"estimatedHeight\": 360}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', NULL, 1, 0, NULL),
(10, 'Nowe Kursy Językowe - Zapisz się już dziś!', 'Promocyjny mailing o kursach językowych dla szkół i uczelni.', 'Inne', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiLz4KICAgIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzYwN2Q4YiIgcng9IjQiLz4KICAgIDx0ZXh0IHg9IjEwMCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgZm9udC13ZWlnaHQ9ImJvbGQiPgogICAgICBOb3dlIEt1cnN5IErEmXp5a293ZSAtIFphcGlzeiBzacSZIGp1xbwgZHppxZshCiAgICA8L3RleHQ+CiAgICA8dGV4dCB4PSIxMDAiIHk9Ijc1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2NjY2NjYiPgogICAgICA2IGJsb2sow7N3KQogICAgPC90ZXh0PgogICAgPHRleHQgeD0iMTAwIiB5PSI5NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjkiIGZpbGw9IiM2NjY2NjYiPgogICAgICBJbm5lCiAgICA8L3RleHQ+CiAgPC9zdmc+', '[]', 'Migracja', '1.0', 0, 0, NULL, '{\"blocks\": 6, \"migratedFrom\": \"legacy-json\", \"migrationDate\": \"2025-10-31T20:55:17.945Z\", \"estimatedHeight\": 360}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', NULL, 1, 0, NULL),
(11, 'Newsletter Firmowy', 'Profesjonalny szablon newslettera z logo, nagłówkiem i stopką', 'newsletter', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiLz4KICAgIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzIxOTZGMyIgcng9IjQiLz4KICAgIDx0ZXh0IHg9IjEwMCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgZm9udC13ZWlnaHQ9ImJvbGQiPgogICAgICBOZXdzbGV0dGVyIEZpcm1vd3kKICAgIDwvdGV4dD4KICAgIDx0ZXh0IHg9IjEwMCIgeT0iNzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzY2NjY2NiI+CiAgICAgIDggYmxvayjDs3cpCiAgICA8L3RleHQ+CiAgICA8dGV4dCB4PSIxMDAiIHk9Ijk1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOSIgZmlsbD0iIzY2NjY2NiI+CiAgICAgIG5ld3NsZXR0ZXIKICAgIDwvdGV4dD4KICA8L3N2Zz4=', '[]', 'Migracja', '1.0', 0, 0, NULL, '{\"blocks\": 8, \"migratedFrom\": \"legacy-json\", \"migrationDate\": \"2025-10-31T20:55:17.945Z\", \"estimatedHeight\": 480}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', NULL, 1, 0, NULL),
(12, 'Powiadomienie - Powitanie', 'Szablon powitalny dla nowych użytkowników lub klientów', 'powiadomienie', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiLz4KICAgIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzI3YWU2MCIgcng9IjQiLz4KICAgIDx0ZXh0IHg9IjEwMCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgZm9udC13ZWlnaHQ9ImJvbGQiPgogICAgICBQb3dpYWRvbWllbmllIC0gUG93aXRhbmllCiAgICA8L3RleHQ+CiAgICA8dGV4dCB4PSIxMDAiIHk9Ijc1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2NjY2NjYiPgogICAgICA5IGJsb2sow7N3KQogICAgPC90ZXh0PgogICAgPHRleHQgeD0iMTAwIiB5PSI5NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjkiIGZpbGw9IiM2NjY2NjYiPgogICAgICBwb3dpYWRvbWllbmllCiAgICA8L3RleHQ+CiAgPC9zdmc+', '[]', 'Migracja', '1.0', 0, 0, NULL, '{\"blocks\": 9, \"migratedFrom\": \"legacy-json\", \"migrationDate\": \"2025-10-31T20:55:17.946Z\", \"estimatedHeight\": 540}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', NULL, 1, 0, NULL),
(13, 'Oferta dla szkół podstawowych', 'Szablon promujący zestawy tabletów edukacyjnych dla szkół podstawowych', 'Inne', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiLz4KICAgIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzYwN2Q4YiIgcng9IjQiLz4KICAgIDx0ZXh0IHg9IjEwMCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgZm9udC13ZWlnaHQ9ImJvbGQiPgogICAgICBPZmVydGEgZGxhIHN6a8OzxYIgcG9kc3Rhd293eWNoCiAgICA8L3RleHQ+CiAgICA8dGV4dCB4PSIxMDAiIHk9Ijc1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2NjY2NjYiPgogICAgICA1IGJsb2sow7N3KQogICAgPC90ZXh0PgogICAgPHRleHQgeD0iMTAwIiB5PSI5NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjkiIGZpbGw9IiM2NjY2NjYiPgogICAgICBJbm5lCiAgICA8L3RleHQ+CiAgPC9zdmc+', '[]', 'Migracja', '1.0', 0, 0, NULL, '{\"blocks\": 5, \"migratedFrom\": \"legacy-json\", \"migrationDate\": \"2025-10-31T20:55:17.946Z\", \"estimatedHeight\": 300}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', NULL, 1, 0, NULL),
(14, 'Promocja - Wielka Wyprzedaż', 'Atrakcyjny szablon promocyjny z dużym rabatem i call-to-action', 'promocja', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiLz4KICAgIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIzMCIgZmlsbD0iI2U3NGMzYyIgcng9IjQiLz4KICAgIDx0ZXh0IHg9IjEwMCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgZm9udC13ZWlnaHQ9ImJvbGQiPgogICAgICBQcm9tb2NqYSAtIFdpZWxrYSBXeXByemVkYcW8CiAgICA8L3RleHQ+CiAgICA8dGV4dCB4PSIxMDAiIHk9Ijc1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2NjY2NjYiPgogICAgICA5IGJsb2sow7N3KQogICAgPC90ZXh0PgogICAgPHRleHQgeD0iMTAwIiB5PSI5NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjkiIGZpbGw9IiM2NjY2NjYiPgogICAgICBwcm9tb2NqYQogICAgPC90ZXh0PgogIDwvc3ZnPg==', '[]', 'Migracja', '1.0', 0, 0, NULL, '{\"blocks\": 9, \"migratedFrom\": \"legacy-json\", \"migrationDate\": \"2025-10-31T20:55:17.947Z\", \"estimatedHeight\": 540}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', NULL, 1, 0, NULL),
(15, 'Laboratoria Szkolne', 'Szablon promujący nowoczesne wyposażenie laboratoriów i pracowni szkolnych', 'Inne', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiLz4KICAgIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzYwN2Q4YiIgcng9IjQiLz4KICAgIDx0ZXh0IHg9IjEwMCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgZm9udC13ZWlnaHQ9ImJvbGQiPgogICAgICBMYWJvcmF0b3JpYSBTemtvbG5lCiAgICA8L3RleHQ+CiAgICA8dGV4dCB4PSIxMDAiIHk9Ijc1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2NjY2NjYiPgogICAgICA2IGJsb2sow7N3KQogICAgPC90ZXh0PgogICAgPHRleHQgeD0iMTAwIiB5PSI5NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjkiIGZpbGw9IiM2NjY2NjYiPgogICAgICBJbm5lCiAgICA8L3RleHQ+CiAgPC9zdmc+', '[]', 'Migracja', '1.0', 0, 0, NULL, '{\"blocks\": 6, \"migratedFrom\": \"legacy-json\", \"migrationDate\": \"2025-10-31T20:55:17.948Z\", \"estimatedHeight\": 360}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', NULL, 1, 0, NULL),
(16, 'Nowoczesne Narzędzia dla Nauczycieli', 'Mailing promujący oprogramowanie i materiały dydaktyczne dla szkół.', 'Inne', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiLz4KICAgIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzYwN2Q4YiIgcng9IjQiLz4KICAgIDx0ZXh0IHg9IjEwMCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgZm9udC13ZWlnaHQ9ImJvbGQiPgogICAgICBOb3dvY3plc25lIE5hcnrEmWR6aWEgZGxhIE5hdWN6eWNpZWxpCiAgICA8L3RleHQ+CiAgICA8dGV4dCB4PSIxMDAiIHk9Ijc1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2NjY2NjYiPgogICAgICAwIGJsb2sow7N3KQogICAgPC90ZXh0PgogICAgPHRleHQgeD0iMTAwIiB5PSI5NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjkiIGZpbGw9IiM2NjY2NjYiPgogICAgICBJbm5lCiAgICA8L3RleHQ+CiAgPC9zdmc+', '[]', 'Migracja', '1.0', 0, 0, NULL, '{\"blocks\": 0, \"migratedFrom\": \"legacy-json\", \"migrationDate\": \"2025-10-31T20:55:17.948Z\", \"estimatedHeight\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', NULL, 1, 0, NULL),
(17, 'Oferta dla uczelni wyższych', 'Szablon promujący licencje oprogramowania edukacyjnego dla uczelni', 'Inne', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmNWY1ZjUiLz4KICAgIDxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIzMCIgZmlsbD0iIzYwN2Q4YiIgcng9IjQiLz4KICAgIDx0ZXh0IHg9IjEwMCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgZm9udC13ZWlnaHQ9ImJvbGQiPgogICAgICBPZmVydGEgZGxhIHVjemVsbmkgd3nFvHN6eWNoCiAgICA8L3RleHQ+CiAgICA8dGV4dCB4PSIxMDAiIHk9Ijc1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2NjY2NjYiPgogICAgICA2IGJsb2sow7N3KQogICAgPC90ZXh0PgogICAgPHRleHQgeD0iMTAwIiB5PSI5NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjkiIGZpbGw9IiM2NjY2NjYiPgogICAgICBJbm5lCiAgICA8L3RleHQ+CiAgPC9zdmc+', '[]', 'Migracja', '1.0', 0, 0, NULL, '{\"blocks\": 6, \"migratedFrom\": \"legacy-json\", \"migrationDate\": \"2025-10-31T20:55:17.949Z\", \"estimatedHeight\": 360}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', NULL, 1, 0, NULL),
(18, 'eeeee', 'eeeee', 'Inne', NULL, '[\"eee\", \"333\"]', 'System', '1.0', 0, 1, NULL, '{\"author\": \"System\", \"version\": \"1.0\", \"createdAt\": \"2025-10-31T22:31:43.723Z\"}', '2025-10-31 22:31:43', '2025-10-31 22:31:43', NULL, 1, 0, NULL);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `mail_addresses`
--

CREATE TABLE `mail_addresses` (
  `id` int(11) NOT NULL,
  `mail_address` varchar(255) NOT NULL,
  `miasto` varchar(255) DEFAULT NULL,
  `rodzaj` varchar(255) DEFAULT NULL,
  `active` int(11) DEFAULT 1,
  `customer_id` int(11) NOT NULL,
  `unsubscribes_date` date DEFAULT NULL,
  `bounce_date` datetime DEFAULT NULL,
  `bounce_reason` text DEFAULT NULL,
  `bounce_count` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL,
  `database_id` int(11) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `hash` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Zrzut danych tabeli `mail_addresses`
--

INSERT INTO `mail_addresses` (`id`, `mail_address`, `miasto`, `rodzaj`, `active`, `customer_id`, `unsubscribes_date`, `bounce_date`, `bounce_reason`, `bounce_count`, `created_at`, `updated_at`, `database_id`, `phone`, `hash`) VALUES
(8, 'czelen@verx.pl', 'DĄBRÓWKA K. RADZYMINA', 'szkola podstawowa', 0, 1, '2025-11-10', NULL, NULL, 0, '2025-11-05 18:39:04', '2025-11-10 21:01:06', 17, NULL, 'GNydufdgizcgRAbAw1G_AIsPP-m1IOZYPXmPqK5xxRE'),
(9, 'czelen.mc@gmail.com', 'JÓZEFÓW', 'szkola podstawowa', 1, 1, NULL, NULL, NULL, 0, '2025-11-05 18:39:04', '2025-11-05 21:28:30', 17, NULL, 'EYISS_Blx6AKtWg32nMa8F_eYVK1v14eYnRCeKmDUvo'),
(30029, 'czelen@verx.pl', 'DĄBRÓWKA K. RADZYMINA', 'szkola podstawowa', 0, 1, '2025-11-10', '2025-11-10 10:13:04', 'RE: wielka promocja', 0, '2025-11-08 20:04:07', '2025-11-10 21:01:06', 21, NULL, 'GNydufdgizcgRAbAw1G_AIsPP-m1IOZYPXmPqK5xxRE'),
(30031, 'asls@wqeqwdqd.pl', '', '', 0, 1, NULL, '2025-12-03 20:18:43', 'Undelivered Mail Returned to Sender', 20, '2025-11-10 09:07:52', '2025-12-03 20:18:43', 21, '', 'VKnr_BN2L4yn-ablDwS7zqvuQ25YggvhLJ-jK7TIV4E'),
(30032, 'bkakiet@gmail.com', '', 'test', 1, 1, NULL, NULL, NULL, 0, '2025-12-02 19:38:07', '2025-12-02 21:17:52', 22, '', '8KBxYA5uJObxhouflk63s5n7GnSaAlT2ctBx9MJQpkg'),
(30033, 'bartlomiej.kakiet@verx.pl', NULL, 'test', 1, 1, NULL, NULL, NULL, 0, '2025-12-02 19:38:40', '2025-12-02 19:38:40', 22, NULL, 'qq52fR6_OVvmlp59OjSuLZdmA6gZv0UATO1O9iH_Esc');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `mail_address_attributes_definitions`
--

CREATE TABLE `mail_address_attributes_definitions` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `attribute_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `mail_address_attribute_value`
--

CREATE TABLE `mail_address_attribute_value` (
  `mail_address_attributes_definitions_id` int(11) NOT NULL,
  `mail_addresses_id` int(11) NOT NULL,
  `mail_address_attributes_value` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `marketing_campanies`
--

CREATE TABLE `marketing_campanies` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `sender_name` varchar(255) DEFAULT NULL,
  `sender_email` varchar(255) DEFAULT NULL,
  `html_content` mediumtext DEFAULT NULL,
  `text_content` text DEFAULT NULL,
  `date_start` timestamp NULL DEFAULT NULL,
  `date_end` timestamp NULL DEFAULT NULL,
  `progress` int(11) DEFAULT NULL,
  `active` tinyint(1) DEFAULT 1,
  `scoring` int(11) DEFAULT NULL,
  `suggestions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `description` text DEFAULT NULL,
  `database_id` int(11) DEFAULT NULL,
  `sent` int(11) DEFAULT 0,
  `reply_check_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `reply_mailbox_host` varchar(255) DEFAULT NULL,
  `reply_mailbox_port` int(11) DEFAULT 993,
  `reply_mailbox_user` varchar(255) DEFAULT NULL,
  `reply_mailbox_pass` varchar(255) DEFAULT NULL,
  `reply_mailbox_protocol` varchar(16) DEFAULT 'IMAP',
  `reply_mailbox_folder` varchar(64) DEFAULT 'INBOX',
  `reply_mailbox_tls` tinyint(1) DEFAULT NULL,
  `reply_mailbox_allow_self_signed` tinyint(1) NOT NULL DEFAULT 0,
  `smtp_host` varchar(255) DEFAULT NULL COMMENT 'Host SMTP dla wysyłki kampanii',
  `smtp_port` int(11) DEFAULT NULL COMMENT 'Port SMTP dla wysyłki kampanii',
  `smtp_user` varchar(255) DEFAULT NULL COMMENT 'Użytkownik SMTP dla wysyłki kampanii',
  `smtp_pass` varchar(255) DEFAULT NULL COMMENT 'Hasło SMTP dla wysyłki kampanii (należy zaszyfrować)',
  `smtp_secure` tinyint(1) DEFAULT 1 COMMENT 'Czy używać TLS/SSL (1=tak, 0=nie)',
  `smtp_allow_self_signed` tinyint(1) DEFAULT 0 COMMENT 'Czy zezwalać na self-signed certificates (1=tak, 0=nie)',
  `sending_in_progress` tinyint(4) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Kampanie marketingowe z własną konfiguracją SMTP do wysyłki i IMAP/POP3 do odbioru odpowiedzi';

--
-- Zrzut danych tabeli `marketing_campanies`
--

INSERT INTO `marketing_campanies` (`id`, `customer_id`, `name`, `subject`, `sender_name`, `sender_email`, `html_content`, `text_content`, `date_start`, `date_end`, `progress`, `active`, `scoring`, `suggestions`, `description`, `database_id`, `sent`, `reply_check_enabled`, `reply_mailbox_host`, `reply_mailbox_port`, `reply_mailbox_user`, `reply_mailbox_pass`, `reply_mailbox_protocol`, `reply_mailbox_folder`, `reply_mailbox_tls`, `reply_mailbox_allow_self_signed`, `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass`, `smtp_secure`, `smtp_allow_self_signed`, `sending_in_progress`) VALUES
(27, 1, 'test 2222', 'test', 'sprzedaz@verx.pl', 'sprzedaz@verx.pl', '<p>das asdas saf fasfgadfsdf asdf asd</p>\n<!-- RODO_FOOTER_END -->\n<p>&nbsp;</p>\n<!-- RODO_FOOTER_START -->\n  <div class=\"rodo-footer\" style=\"font-size:12px;color:#666;margin-top:24px;border-top:1px solid #eee;padding-top:12px;text-align:center;line-height:1.4;\">\n    Otrzymałeś(-aś) tę wiadomość, ponieważ adres e-mail znajduje się w naszej bazie.\n\n    Administratorem danych jest Verx Sp. z o.o (joeyki 52  11-123 warszawa).\n\n    Jeśli nie chcesz otrzymywać od nas wiadomości, możesz się wypisać klikając\n\n    <a href=\"{{UNSUBSCRIBE_URL}}\" style=\"color:#666;\">tutaj</a>.\n  </div>\n<!-- RODO_FOOTER_END -->\n', NULL, '2025-11-04 18:39:00', NULL, NULL, 1, 25, '[{\"problem\":\"Nieoptymalna długość tematu\",\"impact\":\"Zwiększa wynik spam o 5 pkt\",\"fix\":\"Upewnij się, że temat ma 20–60 znaków; testuj warianty A/B.\",\"scoreValue\":5},{\"problem\":\"Personalizacja obecna\",\"impact\":\"Zmniejsza ryzyko oznaczenia jako spam\",\"fix\":\"Personalizuj wiadomości, aby zwiększyć zaangażowanie.\",\"scoreValue\":-8},{\"problem\":\"Optymalna długość treści\",\"impact\":\"Pozytywny sygnał\",\"fix\":\"Utrzymaj treść w zakresie 100–2000 znaków.\",\"scoreValue\":4},{\"problem\":\"Stopka i informacje RODO obecne\",\"impact\":\"Zmniejsza ryzyko\",\"fix\":\"Upewnij się, że dane kontaktowe i instrukcja wypisania są widoczne.\",\"scoreValue\":8},{\"problem\":\"Przestarzałe lub nieczyste HTML\",\"impact\":\"Zwiększa wynik spam o 8 pkt\",\"fix\":\"Użyj semantycznego HTML5, unikaj <font>, <marquee>, inline style.\",\"scoreValue\":8},{\"problem\":\"Poprawne SPF/DKIM/DMARC\",\"impact\":\"Zmniejsza ryzyko\",\"fix\":\"Utrzymuj ustawienia i monitoruj raporty DMARC.\",\"scoreValue\":-8},{\"problem\":\"Słowa kojarzone ze spamem w treści\",\"impact\":\"Może dodać ~6 pkt\",\"fix\":\"Zastąp słowa reklamowe alternatywnymi określeniami.\",\"scoreValue\":6},{\"problem\":\"Link do wypisania się obecny\",\"impact\":\"Zmniejsza wynik spam o 8 pkt\",\"fix\":\"Upewnij się, że link działa i jest widoczny.\",\"scoreValue\":8}]', '', 21, 1, 1, 'mail.aculeo.pl', 993, 'sprzedaz@verx.pl', 'Verx@123!', 'IMAP', 'INBOX', 1, 1, 'mail.aculeo.pl', 465, 'sprzedaz@verx.pl', 'Verx@123!', 1, 1, 0),
(28, 1, 'wwww', 'wielka promocja', 'sprzedaz@verx.pl', 'sprzedaz@verx.pl', '\n<div style=\"\n  margin-top: 40px;\n  padding-top: 20px;\n  border-top: 1px solid #e0e0e0;\n  font-size: 12px;\n  color: #666666;\n  text-align: center;\n  line-height: 1.4;\n\">\n  <p>Ta wiadomość została wysłana do Ciebie, ponieważ wyraziłeś zgodę na otrzymywanie informacji marketingowych.</p>\n  \n  <p>Zgodnie z RODO, informujemy że:</p>\n  <ul style=\"text-align: left; display: inline-block; margin: 10px 0;\">\n    <li>Administratorem Twoich danych osobowych jest sprzedaz@verx.pl</li>\n    <li>Twoje dane są przetwarzane w celu prowadzenia marketingu bezpośredniego</li>\n    <li>Masz prawo do wycofania zgody w dowolnym momencie</li>\n    <li>Masz prawo dostępu, sprostowania, usunięcia lub ograniczenia przetwarzania swoich danych</li>\n  </ul>\n  \n  <p>\n    <a href=\"{{UNSUBSCRIBE_URL}}\" \n       style=\"color: #007bff; text-decoration: underline;\">\n      Wypisz się z listy mailingowej\n    </a>\n  </p>\n  \n  <p style=\"margin-top: 15px; font-size: 11px; color: #999999;\">\n    sprzedaz@verx.pl | sprzedaz@verx.pl\n  </p>\n</div>', NULL, '2025-11-04 18:39:00', NULL, NULL, 1, 41, '[{\"problem\":\"Nieoptymalna długość tematu\",\"impact\":\"Zwiększa wynik spam o 5 pkt\",\"fix\":\"Upewnij się, że temat ma 20–60 znaków; testuj warianty A/B.\",\"scoreValue\":5},{\"problem\":\"Słowa kojarzone ze spamem w temacie: promo, promocja\",\"impact\":\"Każde słowo ~8 pkt\",\"fix\":\"Usuń lub złagodź słowa typu \'free\', \'promocja\', \'kup teraz\' itp.\",\"scoreValue\":16},{\"problem\":\"Personalizacja obecna\",\"impact\":\"Zmniejsza ryzyko oznaczenia jako spam\",\"fix\":\"Personalizuj wiadomości, aby zwiększyć zaangażowanie.\",\"scoreValue\":-8},{\"problem\":\"Optymalna długość treści\",\"impact\":\"Pozytywny sygnał\",\"fix\":\"Utrzymaj treść w zakresie 100–2000 znaków.\",\"scoreValue\":4},{\"problem\":\"Stopka i informacje RODO obecne\",\"impact\":\"Zmniejsza ryzyko\",\"fix\":\"Upewnij się, że dane kontaktowe i instrukcja wypisania są widoczne.\",\"scoreValue\":8},{\"problem\":\"Przestarzałe lub nieczyste HTML\",\"impact\":\"Zwiększa wynik spam o 8 pkt\",\"fix\":\"Użyj semantycznego HTML5, unikaj <font>, <marquee>, inline style.\",\"scoreValue\":8},{\"problem\":\"Poprawne SPF/DKIM/DMARC\",\"impact\":\"Zmniejsza ryzyko\",\"fix\":\"Utrzymuj ustawienia i monitoruj raporty DMARC.\",\"scoreValue\":-8},{\"problem\":\"Słowa kojarzone ze spamem w treści\",\"impact\":\"Może dodać ~6 pkt\",\"fix\":\"Zastąp słowa reklamowe alternatywnymi określeniami.\",\"scoreValue\":6},{\"problem\":\"Link do wypisania się obecny\",\"impact\":\"Zmniejsza wynik spam o 8 pkt\",\"fix\":\"Upewnij się, że link działa i jest widoczny.\",\"scoreValue\":8}]', '', 21, 1, 1, 'mail.aculeo.pl', 993, 'sprzedaz@verx.pl', 'Verx@123!', 'IMAP', 'INBOX', 1, 1, 'mail.aculeo.pl', 465, 'sprzedaz@verx.pl', 'Verx@123!', 1, 1, 0),
(29, 1, 'Black Week dla edukacji test', 'Black Week dla edukacji test', 'verx@nowoczesnaszkola20.pl', 'verx@nowoczesnaszkola20.pl', '<div style=\"margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666666; text-align: center; line-height: 1.4;\">\n<p><em><span style=\"font-family: \'Aptos\',sans-serif; mso-bidi-font-family: Aptos;\">Szanowni Państwo!</span></em></p>\n<p><em><span style=\"font-family: \'Aptos\',sans-serif; mso-bidi-font-family: Aptos;\">Z okazji zbliżającego się Black Week mam przyjemność przedsatwić wyjątkową propozycję cenową dla plac&oacute;wek oświatowych.</span></em><br><br><em><span style=\"font-family: \'Aptos\',sans-serif; mso-bidi-font-family: Aptos;\">Zam&oacute;wienie realizowane są bez konieczności przedpłaty, na podstawie deklaracji przesłanych mailem.</span></em><em><br><span style=\"font-family: \'Aptos\',sans-serif; mso-bidi-font-family: Aptos;\">W ciągu dw&oacute;ch dni potwierdzimy zam&oacute;wienie i wyślemy sprzęt wraz z fakturą płatną 14 dni.</span></em><em><span style=\"font-family: \'Arial\',sans-serif;\">​</span></em><em><br><span style=\"font-family: \'Aptos\',sans-serif; mso-bidi-font-family: Aptos;\">Istnieje możliwość rozbicia płatności na r&oacute;żne faktury oraz przeniesienia całości koszt&oacute;w na faktury za szkolenia!</span></em></p>\n<p><strong><span style=\"font-family: \'Aptos\',sans-serif; mso-bidi-font-family: Aptos;\">PROPOZYCJA SPECJALNA</span></strong></p>\n<p><u>NOWOŚĆ Dotykowy Monitor interkatywny myBoard WHITE ARROW 65\" UHD 4K z Androidem 13.0</u><br><strong><span style=\"font-family: \'Aptos\',sans-serif; mso-bidi-font-family: Aptos;\">w cenie black week <s>7500</s> 6000 zł brutto</span></strong> wraz z kosztami wysyłki. Cena zawiera stawkę 0 % vat dla edukacji.</p>\n<p><u>NOWOŚĆ Dotykowy Monitor interkatywny myBoard WHITE ARROW 75\" UHD 4K z Androidem 13.0</u><br><strong><span style=\"font-family: \'Aptos\',sans-serif; mso-bidi-font-family: Aptos;\">w cenie black week <s>9500</s> 7500 zł brutto</span></strong> wraz z kosztami wysyłki. Cena zawiera stawkę 0 % vat dla edukacji.</p>\n<p><u>NOWOŚĆ Dotykowy Monitor interkatywny myBoard WHITE ARROW 86\" UHD 4K z Androidem 13.0</u><br><strong><span style=\"font-family: \'Aptos\',sans-serif; mso-bidi-font-family: Aptos;\">w cenie black week <s>12500</s> 8500 zł brutto</span></strong> wraz z kosztami wysyłki. Cena zawiera stawkę 0 % vat dla edukacji.</p>\n<p><strong><span style=\"font-family: \'Aptos\',sans-serif; mso-bidi-font-family: Aptos;\">SPRZĘT INTERAKTYWNY</span></strong></p>\n<p><strong><u>Notebook Dell Pro 15 Essential PV15250 15,6\"FHD/i5-1334U/8GB/SSD512GB/IrisXe/11PR</u></strong></p>\n<p><strong><span style=\"font-family: \'Aptos\',sans-serif; mso-bidi-font-family: Aptos;\">w cenie black week</span></strong> <strong><s><span style=\"font-family: \'Aptos\',sans-serif; mso-bidi-font-family: Aptos;\">2800</span></s></strong><strong><span style=\"font-family: \'Aptos\',sans-serif; mso-bidi-font-family: Aptos;\"> 2650 zł</span></strong> <strong><span style=\"font-family: \'Aptos\',sans-serif; mso-bidi-font-family: Aptos;\">brutto</span></strong> wraz z kosztami wysyłki.</p>\n<p><strong><u>Notebook Dell 15 DC15250 15,6\"FHD/i3-1305U/8GB/SSD512GB/UHD/11PR</u></strong></p>\n<p><strong><span style=\"font-family: \'Aptos\',sans-serif; mso-bidi-font-family: Aptos;\">w cenie black week <s>2450</s> 2290 zł brutto </span></strong>wraz z kosztami wysyłki.</p>\n<p><strong><u>Projektor Benq MX560C DLP XGA 4000ANSI 20 000:1 VGA HDMI</u></strong></p>\n<p><strong><span style=\"font-family: \'Aptos\',sans-serif; mso-bidi-font-family: Aptos;\">w cenie black week <s>2100</s> 1950 zł brutto</span></strong> wraz z kosztami wysyłki.</p>\n<p><strong><u>Projektor BenQ MH560 DLP FHD 3800ANSI 20 000:1 VGA 2xHDMI USB MiniUSB-B</u></strong></p>\n<p><strong><span style=\"font-family: \'Aptos\',sans-serif; mso-bidi-font-family: Aptos;\">w cenie black week <s>3600</s> 3330 zł brutto</span></strong> wraz z kosztami wysyłki.</p>\n<p>Bartłomiej Kakiet</p>\n<p><strong><span style=\"font-family: \'Aptos\',sans-serif; mso-bidi-font-family: Aptos;\">tel kom: 668820284</span></strong></p>\n<p><strong><span style=\"font-family: \'Aptos\',sans-serif; mso-bidi-font-family: Aptos;\">email: <a href=\"mailto:bkakiet@gmail.com\"><span style=\"font-weight: normal;\">bkakiet@gmail.com</span></a></span></strong></p>\n<p>verx sp. z o.o.<br>ul. Joteyki 13/52<br>02-317 Warszawa</p>\n</div>\n<!-- RODO_FOOTER_START -->\n<div class=\"rodo-footer\" style=\"font-size: 12px; color: #666; margin-top: 24px; border-top: 1px solid #eee; padding-top: 12px; text-align: center; line-height: 1.4;\">Otrzymałeś(-aś) tę wiadomość, ponieważ adres e-mail znajduje się w naszej bazie. Administratorem danych jest Verx Sp. z o.o (ul. Joteyki 13/52 02-317 Warszawa). Jeśli nie chcesz otrzymywać od nas wiadomości, możesz się wypisać klikając&nbsp;<a style=\"color: #666;\" href=\"{{UNSUBSCRIBE_URL}}\">tutaj</a>.</div>\n<!-- RODO_FOOTER_END -->\n<div style=\"\n  margin-top: 40px;\n  padding-top: 20px;\n  border-top: 1px solid #e0e0e0;\n  font-size: 12px;\n  color: #666666;\n  text-align: center;\n  line-height: 1.4;\n\">\n  <p>Ta wiadomość została wysłana do Ciebie, ponieważ wyraziłeś zgodę na otrzymywanie informacji marketingowych.</p>\n  \n  <p>Zgodnie z RODO, informujemy że:</p>\n  <ul style=\"text-align: left; display: inline-block; margin: 10px 0;\">\n    <li>Administratorem Twoich danych osobowych jest verx@nowoczesnaszkola20.pl</li>\n    <li>Twoje dane są przetwarzane w celu prowadzenia marketingu bezpośredniego</li>\n    <li>Masz prawo do wycofania zgody w dowolnym momencie</li>\n    <li>Masz prawo dostępu, sprostowania, usunięcia lub ograniczenia przetwarzania swoich danych</li>\n  </ul>\n  \n  <p>\n    <a href=\"{{UNSUBSCRIBE_URL}}\" \n       style=\"color: #007bff; text-decoration: underline;\">\n      Wypisz się z listy mailingowej\n    </a>\n  </p>\n  \n  <p style=\"margin-top: 15px; font-size: 11px; color: #999999;\">\n    verx@nowoczesnaszkola20.pl | verx@nowoczesnaszkola20.pl\n  </p>\n</div>', NULL, '2025-12-02 19:53:00', NULL, NULL, 1, 26, '[{\"problem\":\"Optymalna długość tematu\",\"impact\":\"Zmniejsza ryzyko oznaczenia jako spam\",\"fix\":\"Temat ma optymalną długość (20–60 znaków).\",\"scoreValue\":-5},{\"problem\":\"Personalizacja obecna\",\"impact\":\"Zmniejsza ryzyko oznaczenia jako spam\",\"fix\":\"Personalizuj wiadomości, aby zwiększyć zaangażowanie.\",\"scoreValue\":-8},{\"problem\":\"Treść zbyt długa\",\"impact\":\"Zwiększa wynik spam o 3 pkt\",\"fix\":\"Skróć treść lub podziel ją na sekcje z linkami do szczegółów.\",\"scoreValue\":3},{\"problem\":\"Stopka i informacje RODO obecne\",\"impact\":\"Zmniejsza ryzyko\",\"fix\":\"Upewnij się, że dane kontaktowe i instrukcja wypisania są widoczne.\",\"scoreValue\":8},{\"problem\":\"Przestarzałe lub nieczyste HTML\",\"impact\":\"Zwiększa wynik spam o 8 pkt\",\"fix\":\"Użyj semantycznego HTML5, unikaj <font>, <marquee>, inline style.\",\"scoreValue\":8},{\"problem\":\"Poprawne SPF/DKIM/DMARC\",\"impact\":\"Zmniejsza ryzyko\",\"fix\":\"Utrzymuj ustawienia i monitoruj raporty DMARC.\",\"scoreValue\":-8},{\"problem\":\"Słowa kojarzone ze spamem w treści\",\"impact\":\"Może dodać ~10 pkt\",\"fix\":\"Zastąp słowa reklamowe alternatywnymi określeniami.\",\"scoreValue\":10},{\"problem\":\"Link do wypisania się obecny\",\"impact\":\"Zmniejsza wynik spam o 8 pkt\",\"fix\":\"Upewnij się, że link działa i jest widoczny.\",\"scoreValue\":8}]', '', 22, 1, 1, 'mail.aculeo.pl', 993, 'verx@nowoczesnaszkola20.pl', 'nyqKDEQBkPt', 'IMAP', 'INBOX', 1, 1, 'mail.aculeo.pl', 465, 'verx@nowoczesnaszkola20.pl', 'nyqKDEQBkPt', 1, 1, 1),
(30, 1, 'Test 2', 'Test2', 'verx@nowoczesnaszkola20.pl', 'verx@nowoczesnaszkola20.pl', '', NULL, '2025-12-02 20:05:00', NULL, NULL, 1, 81, '[{\"problem\":\"Nieoptymalna długość tematu\",\"impact\":\"Zwiększa wynik spam o 5 pkt\",\"fix\":\"Upewnij się, że temat ma 20–60 znaków; testuj warianty A/B.\",\"scoreValue\":5},{\"problem\":\"Brak personalizacji\",\"impact\":\"Zwiększa wynik spam o 10 pkt\",\"fix\":\"Dodaj znaczniki personalizacji (np. %imie%, {{first_name}}).\",\"scoreValue\":10},{\"problem\":\"Treść zbyt krótka\",\"impact\":\"Zwiększa wynik spam o 10 pkt\",\"fix\":\"Dodaj więcej wartościowej treści opisującej ofertę/korzyść.\",\"scoreValue\":10},{\"problem\":\"Brak stopki / informacji RODO\",\"impact\":\"Zwiększa wynik spam o 6 pkt\",\"fix\":\"Dodaj stopkę z danymi firmy, informacją o przetwarzaniu danych i kontakcie.\",\"scoreValue\":6},{\"problem\":\"Poprawne formatowanie HTML\",\"impact\":\"Zmniejsza ryzyko\",\"fix\":\"Utrzymuj semantyczne tagi i minimalny inline CSS.\",\"scoreValue\":-6},{\"problem\":\"Poprawne SPF/DKIM/DMARC\",\"impact\":\"Zmniejsza ryzyko\",\"fix\":\"Utrzymuj ustawienia i monitoruj raporty DMARC.\",\"scoreValue\":-8},{\"problem\":\"Brak linku do wypisania się\",\"impact\":\"Zwiększa wynik spam o 22 pkt\",\"fix\":\"Dodaj wyraźny link lub instrukcję wypisania się.\",\"scoreValue\":22}]', '', 22, 1, 1, 'mail.aculeo.pl', 993, 'verx@nowoczesnaszkola20.pl', 'nyqKDEQBkPt', 'IMAP', 'INBOX', 1, 1, 'mail.aculeo.pl', 465, 'verx@nowoczesnaszkola20.pl', 'nyqKDEQBkPt', 1, 1, 1);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `marketing_campanies_mailing_result`
--

CREATE TABLE `marketing_campanies_mailing_result` (
  `marketing_campanies_id` int(11) NOT NULL,
  `mail_addresses_id` int(11) NOT NULL,
  `is_readed` tinyint(1) DEFAULT NULL,
  `respons_date` date DEFAULT NULL,
  `is_send` tinyint(1) DEFAULT NULL,
  `send_date` date DEFAULT NULL,
  `message_id` varchar(255) DEFAULT NULL,
  `error` int(11) DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `error_count` int(11) DEFAULT NULL,
  `send_error_code` varchar(50) DEFAULT NULL,
  `send_error_type` varchar(50) DEFAULT NULL,
  `last_error_date` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Zrzut danych tabeli `marketing_campanies_mailing_result`
--

INSERT INTO `marketing_campanies_mailing_result` (`marketing_campanies_id`, `mail_addresses_id`, `is_readed`, `respons_date`, `is_send`, `send_date`, `message_id`, `error`, `error_message`, `error_count`, `send_error_code`, `send_error_type`, `last_error_date`) VALUES
(27, 8, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(27, 9, NULL, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(27, 30029, 1, '2025-11-10', 1, '2025-11-10', '<1762807592592.vrztm1czlql@mail.yourcompany.com>', 0, NULL, 0, NULL, NULL, NULL),
(27, 30031, NULL, NULL, 1, '2025-11-10', '<1762807592699.xbq356p9zu@mail.yourcompany.com>', 0, NULL, 0, NULL, NULL, NULL),
(28, 30029, 1, '2025-11-10', 1, '2025-11-10', '<1762807592819.0qta0090zmvo@mail.yourcompany.com>', 0, NULL, 0, NULL, NULL, NULL),
(28, 30031, NULL, NULL, 1, '2025-11-10', '<1762807592921.6a6ysckcn6@mail.yourcompany.com>', 0, NULL, 0, NULL, NULL, NULL),
(29, 30032, NULL, NULL, 1, '2025-12-02', '<1764705205721.ixvswaywfuh@mail.yourcompany.com>', NULL, NULL, NULL, NULL, NULL, NULL),
(29, 30033, NULL, NULL, 1, '2025-12-02', '<1764705205837.qwkxgl4f4i@mail.yourcompany.com>', NULL, NULL, NULL, NULL, NULL, NULL),
(30, 30032, NULL, NULL, 1, '2025-12-02', '<1764710734203.gatz5biemn@mail.yourcompany.com>', NULL, NULL, NULL, NULL, NULL, NULL),
(30, 30033, NULL, NULL, 1, '2025-12-02', '<1764710734306.bkqdkciyd2@mail.yourcompany.com>', NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `token_hash` char(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `used_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `permission`
--

CREATE TABLE `permission` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `permission_objects_id` int(11) DEFAULT NULL,
  `permission_function_id` int(11) DEFAULT NULL,
  `access_level` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `permission_function`
--

CREATE TABLE `permission_function` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Zrzut danych tabeli `permission_function`
--

INSERT INTO `permission_function` (`id`, `name`) VALUES
(1, 'read'),
(2, 'write'),
(3, 'manage'),
(4, 'delete');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `permission_objects`
--

CREATE TABLE `permission_objects` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Zrzut danych tabeli `permission_objects`
--

INSERT INTO `permission_objects` (`id`, `name`) VALUES
(1, 'users'),
(2, 'mail_addresses'),
(3, 'campaigns'),
(4, 'reports');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL COMMENT 'Unikalna nazwa roli (np. administrator, marketer)',
  `display_name` varchar(100) NOT NULL COMMENT 'Wyświetlana nazwa roli',
  `description` text DEFAULT NULL COMMENT 'Opis roli i jej uprawnień',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Zrzut danych tabeli `roles`
--

INSERT INTO `roles` (`id`, `name`, `display_name`, `description`, `created_at`) VALUES
(1, 'administrator', 'Administrator', 'Zarządzanie systemem - pełny dostęp do wszystkich funkcji, w tym zarządzanie użytkownikami', '2026-10-05 18:22:48'),
(2, 'marketer', 'Marketer', 'Tworzenie i wysyłanie kampanii mailowych, dostęp do edytora email i statystyk kampanii', '2026-10-05 18:22:48'),
(3, 'data_administrator', 'Administrator danych', 'Zarządzanie bazami danych i kontaktami, import danych, tworzenie segmentów', '2026-10-05 18:22:48');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `template_blocks`
--

CREATE TABLE `template_blocks` (
  `id` int(11) NOT NULL,
  `templateId` int(11) NOT NULL COMMENT 'ID szablonu',
  `blockType` varchar(50) NOT NULL,
  `blockOrder` int(11) NOT NULL DEFAULT 0 COMMENT 'Kolejność bloku w template (0, 1, 2, ...)',
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Zawartość bloku w formacie JSON (text, fontSize, color, etc.)',
  `style` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Style bloku w formacie JSON (marginTop, marginBottom, textAlign, etc.)',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Dodatkowe metadane bloku (np. rozmiar wygenerowanego contentu)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabela bloków składających się na szablon email';

--
-- Zrzut danych tabeli `template_blocks`
--

INSERT INTO `template_blocks` (`id`, `templateId`, `blockType`, `blockOrder`, `content`, `style`, `createdAt`, `updatedAt`, `isActive`, `metadata`) VALUES
(1, 1, 'image', 0, '{\"alt\": \"Logo firmy\", \"src\": \"https://via.placeholder.com/300x80/2196F3/ffffff?text=LOGO+FIRMY\", \"url\": \"\", \"width\": 300, \"height\": 80, \"borderRadius\": 0}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 32}', '2025-10-31 20:00:42', '2025-10-31 20:00:42', 1, NULL),
(2, 1, 'text', 1, '{\"text\": \"Newsletter - Październik 2025\", \"color\": \"#2c3e50\", \"fontSize\": 28, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:00:42', '2025-10-31 20:00:42', 1, NULL),
(3, 1, 'text', 2, '{\"text\": \"Witaj w naszym miesięcznym newsletterze! Przygotowaliśmy dla Ciebie najważniejsze informacje z naszej firmy, nowości produktowe oraz ekskluzywne oferty.\", \"color\": \"#333333\", \"fontSize\": 16, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 24}', '2025-10-31 20:00:42', '2025-10-31 20:00:42', 1, NULL),
(4, 1, 'text', 3, '{\"text\": \"🎉 Nowości tego miesiąca\", \"color\": \"#e74c3c\", \"fontSize\": 22, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 32, \"textAlign\": \"left\", \"marginBottom\": 16}', '2025-10-31 20:00:42', '2025-10-31 20:00:42', 1, NULL),
(5, 1, 'text', 4, '{\"text\": \"• Nowa wersja naszej aplikacji z ulepszonymi funkcjami\\n• Program lojalnościowy dla stałych klientów\\n• Rozszerzona oferta produktów ekologicznych\\n• Nowe partnerstwa biznesowe\", \"color\": \"#333333\", \"fontSize\": 15, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 32}', '2025-10-31 20:00:42', '2025-10-31 20:00:42', 1, NULL),
(6, 1, 'button', 5, '{\"url\": \"https://example.com/nowosci\", \"text\": \"Zobacz więcej nowości\", \"padding\": \"14px 28px\", \"textColor\": \"#ffffff\", \"borderRadius\": 6, \"backgroundColor\": \"#3498db\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 40}', '2025-10-31 20:00:42', '2025-10-31 20:00:42', 1, NULL),
(7, 1, 'spacer', 6, '{\"height\": 30, \"borderRadius\": 0, \"backgroundColor\": \"transparent\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 0}', '2025-10-31 20:00:42', '2025-10-31 20:00:42', 1, NULL),
(8, 1, 'text', 7, '{\"text\": \"Dziękujemy za bycie z nami!\\n\\nZespół [Nazwa Firmy]\\nwww.example.com | kontakt@example.com\\n\\nJeśli nie chcesz otrzymywać tych wiadomości, możesz się wypisać.\", \"color\": \"#666666\", \"fontSize\": 12, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 0}', '2025-10-31 20:00:42', '2025-10-31 20:00:42', 1, NULL),
(9, 2, 'text', 0, '{\"text\": \"🔥 WIELKA WYPRZEDAŻ 🔥\", \"color\": \"#e74c3c\", \"fontSize\": 32, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 20, \"textAlign\": \"center\", \"marginBottom\": 10}', '2025-10-31 20:00:42', '2025-10-31 20:00:42', 1, NULL),
(10, 2, 'text', 1, '{\"text\": \"DO -50% NA WSZYSTKO!\", \"color\": \"#c34333\", \"fontSize\": 24, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 20}', '2025-10-31 20:00:42', '2025-10-31 20:00:42', 1, NULL),
(11, 2, 'text', 2, '{\"text\": \"Nie przegap tej wyjątkowej okazji! Rabaty do 50% na cały asortyment. Promocja ważna tylko do końca miesiąca.\", \"color\": \"#333333\", \"fontSize\": 16, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 30}', '2025-10-31 20:00:42', '2025-10-31 20:00:42', 1, NULL),
(12, 2, 'button', 3, '{\"url\": \"https://example.com/promocja\", \"text\": \"KUP TERAZ Z RABATEM\", \"padding\": \"16px 32px\", \"textColor\": \"#ffffff\", \"borderRadius\": 8, \"backgroundColor\": \"#e74c3c\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 20}', '2025-10-31 20:00:42', '2025-10-31 20:00:42', 1, NULL),
(13, 2, 'text', 4, '{\"text\": \"Kod promocyjny: WYPRZEDAŻ2025\", \"color\": \"#27ae60\", \"fontSize\": 18, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 30}', '2025-10-31 20:00:42', '2025-10-31 20:00:42', 1, NULL),
(14, 2, 'text', 5, '{\"text\": \"* Promocja ważna do 31.10.2025. Nie łączy się z innymi rabatami.\", \"color\": \"#666666\", \"fontSize\": 12, \"fontStyle\": \"italic\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 20, \"textAlign\": \"center\", \"marginBottom\": 0}', '2025-10-31 20:00:42', '2025-10-31 20:00:42', 1, NULL),
(15, 3, 'text', 0, '{\"text\": \"👋 Witaj!\", \"color\": \"#27ae60\", \"fontSize\": 32, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 20, \"textAlign\": \"center\", \"marginBottom\": 16}', '2025-10-31 20:00:42', '2025-10-31 20:00:42', 1, NULL),
(16, 3, 'text', 1, '{\"text\": \"Dziękujemy za rejestrację!\", \"color\": \"#2c3e50\", \"fontSize\": 24, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:00:42', '2025-10-31 20:00:42', 1, NULL),
(17, 3, 'text', 2, '{\"text\": \"Twoje konto zostało pomyślnie utworzone. Teraz możesz korzystać ze wszystkich funkcji naszej platformy.\", \"color\": \"#333333\", \"fontSize\": 16, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 32}', '2025-10-31 20:00:42', '2025-10-31 20:00:42', 1, NULL),
(18, 3, 'button', 3, '{\"url\": \"https://example.com/dashboard\", \"text\": \"Zacznij korzystać\", \"padding\": \"14px 28px\", \"textColor\": \"#ffffff\", \"borderRadius\": 6, \"backgroundColor\": \"#3498db\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 40}', '2025-10-31 20:00:42', '2025-10-31 20:00:42', 1, NULL),
(19, 3, 'text', 4, '{\"text\": \"Jeśli masz pytania, skontaktuj się z nami pod adresem support@example.com\", \"color\": \"#7f8c8d\", \"fontSize\": 12, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 20, \"textAlign\": \"center\", \"marginBottom\": 0}', '2025-10-31 20:00:42', '2025-10-31 20:00:42', 1, NULL),
(20, 4, 'text', 0, '{\"text\": \"Witaj w naszym newsletterze!\", \"color\": \"#2c3e50\", \"fontSize\": 24, \"fontStyle\": \"normal\", \"fontFamily\": \"Arial, sans-serif\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 20}', '2025-10-31 20:54:52', '2025-10-31 20:54:52', 1, NULL),
(21, 4, 'text', 1, '{\"text\": \"To jest treść testowego newslettera. Lorem ipsum dolor sit amet, consectetur adipiscing elit.\", \"color\": \"#333333\", \"fontSize\": 16, \"fontStyle\": \"normal\", \"fontFamily\": \"Arial, sans-serif\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 20}', '2025-10-31 20:54:52', '2025-10-31 20:54:52', 1, NULL),
(22, 4, 'button', 2, '{\"url\": \"https://example.com\", \"text\": \"Czytaj więcej\", \"padding\": \"14px 28px\", \"textColor\": \"#ffffff\", \"borderRadius\": 6, \"backgroundColor\": \"#3498db\"}', '{\"marginTop\": 10, \"textAlign\": \"center\", \"marginBottom\": 20}', '2025-10-31 20:54:52', '2025-10-31 20:54:52', 1, NULL),
(23, 5, 'text', 0, '{\"text\": \"🎓 OFERTA SPECJALNA DLA SZKÓŁ I UCZELNI\", \"color\": \"#2c3e50\", \"fontSize\": 26, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 16, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:17', '2025-10-31 20:55:17', 1, NULL),
(24, 5, 'text', 1, '{\"text\": \"Wyposaż swoją placówkę edukacyjną w nowoczesny sprzęt i technologie wspierające naukę.\", \"color\": \"#34495e\", \"fontSize\": 18, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 32}', '2025-10-31 20:55:17', '2025-10-31 20:55:17', 1, NULL),
(25, 5, 'image', 2, '{\"alt\": \"Laptopy edukacyjne\", \"src\": \"https://via.placeholder.com/500x200/468bf2/ffffff?text=Laptopy+dla+edukacji\", \"url\": \"https://example.com/produkty/laptop-edukacyjny\", \"width\": 500, \"height\": 200, \"borderRadius\": 10}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:17', '2025-10-31 20:55:17', 1, NULL),
(26, 5, 'text', 3, '{\"text\": \"💻 **Laptop EduSmart 14\\\"**\\n- Procesor Intel i5, 16 GB RAM, SSD 512 GB\\n- Lekka konstrukcja (1,3 kg)\\n- Wydłużony czas pracy na baterii (do 12h)\\n- Idealny do zajęć zdalnych i pracy w sali\\n\\nCena specjalna dla instytucji edukacyjnych: **od 2199 zł netto/szt.**\", \"color\": \"#2c3e50\", \"fontSize\": 14, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 24}', '2025-10-31 20:55:17', '2025-10-31 20:55:17', 1, NULL),
(27, 5, 'button', 4, '{\"url\": \"https://example.com/produkty/laptop-edukacyjny\", \"text\": \"ZOBACZ OFERTĘ\", \"padding\": \"16px 40px\", \"textColor\": \"#ffffff\", \"borderRadius\": 8, \"backgroundColor\": \"#468bf2\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 32}', '2025-10-31 20:55:17', '2025-10-31 20:55:17', 1, NULL),
(28, 5, 'text', 5, '{\"text\": \"📦 Dla większych zamówień oferujemy rabaty oraz możliwość leasingu sprzętu edukacyjnego.\", \"color\": \"#e67e22\", \"fontSize\": 14, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:17', '2025-10-31 20:55:17', 1, NULL),
(29, 5, 'text', 6, '{\"text\": \"Skontaktuj się z naszym działem sprzedaży edukacyjnej:\\n📧 edu@techmarket.pl | ☎️ +48 22 555 44 33\\n\\nTechMarket Sp. z o.o. | www.techmarket.pl\\nRegulamin | Polityka prywatności\", \"color\": \"#7f8c8d\", \"fontSize\": 11, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 0}', '2025-10-31 20:55:17', '2025-10-31 20:55:17', 1, NULL),
(30, 6, 'text', 0, '{\"text\": \"🎯 ZAPROSZENIE NA KONFERENCJĘ\", \"color\": \"#674ea7\", \"fontSize\": 26, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 16, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(31, 6, 'text', 1, '{\"text\": \"\\\"Przyszłość Technologii 2025\\\"\", \"color\": \"#2c3e50\", \"fontSize\": 22, \"fontStyle\": \"italic\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 32}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(32, 6, 'image', 2, '{\"alt\": \"Konferencja Przyszłość Technologii 2025\", \"src\": \"https://via.placeholder.com/400x180/674ea7/ffffff?text=KONFERENCJA+2025\", \"url\": \"https://example.com/konferencja\", \"width\": 400, \"height\": 180, \"borderRadius\": 10}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 32}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(33, 6, 'text', 3, '{\"text\": \"📅 Data: 15 listopada 2025\\n🕐 Godzina: 9:00 - 17:00\\n📍 Miejsce: Centrum Konferencyjne, Warszawa\\n🎟️ Wstęp: bezpłatny (wymagana rejestracja)\", \"color\": \"#333333\", \"fontSize\": 16, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(34, 6, 'text', 4, '{\"text\": \"Program obejmuje:\", \"color\": \"#34495e\", \"fontSize\": 18, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 16, \"textAlign\": \"left\", \"marginBottom\": 12}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(35, 6, 'text', 5, '{\"text\": \"🚀 Sztuczna inteligencja w biznesie\\n💡 Innowacje w dziedzinie IoT\\n🌐 Trendy w cyberbezpieczeństwie\\n📊 Big Data i analityka predykcyjna\\n🤖 Automatyzacja procesów biznesowych\\n☕ Przerwy kawowe i networking\", \"color\": \"#333333\", \"fontSize\": 14, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 32}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(36, 6, 'button', 6, '{\"url\": \"https://example.com/rejestracja-konferencja\", \"text\": \"ZAPISZ SIĘ TERAZ\", \"padding\": \"16px 40px\", \"textColor\": \"#ffffff\", \"borderRadius\": 8, \"backgroundColor\": \"#27ae60\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(37, 6, 'text', 7, '{\"text\": \"⚡ Liczba miejsc ograniczona - nie zwlekaj z rejestracją!\", \"color\": \"#e74c3c\", \"fontSize\": 14, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 40}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(38, 6, 'spacer', 8, '{\"height\": 1, \"borderRadius\": 0, \"backgroundColor\": \"#bdc3c7\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 20}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(39, 6, 'text', 9, '{\"text\": \"Organizator: Tech Conferences Sp. z o.o.\\nKontakt: events@techconf.pl | +48 22 123 45 67\\n\\nJeśli nie możesz uczestniczyć, przekaż zaproszenie dalej!\\nRezygnacja z newslettera | Regulamin uczestnictwa\", \"color\": \"#7f8c8d\", \"fontSize\": 11, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(40, 7, 'text', 0, '{\"text\": \"📽️ NOWE PROJEKTORY INTERAKTYWNE DLA LICEÓW I TECHNIKÓW\", \"color\": \"#117a65\", \"fontSize\": 26, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 16, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(41, 7, 'image', 1, '{\"alt\": \"Projektor edukacyjny\", \"src\": \"https://via.placeholder.com/500x200/117a65/ffffff?text=Projektory+Interaktywne\", \"url\": \"https://example.com/produkty/projektor-interaktywny\", \"width\": 500, \"height\": 200, \"borderRadius\": 10}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(42, 7, 'text', 2, '{\"text\": \"Projektor EduVision 4K – duży ekran, interaktywne funkcje, łatwa instalacja\\n- Obsługa dotyku i rysika\\n- Idealny do sal wykładowych\\n- Cena dla szkół: **od 3999 zł/szt.**\", \"color\": \"#117a65\", \"fontSize\": 14, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(43, 7, 'button', 3, '{\"url\": \"https://example.com/produkty/projektor-interaktywny\", \"text\": \"ZOBACZ OFERTĘ\", \"padding\": \"16px 40px\", \"textColor\": \"#ffffff\", \"borderRadius\": 8, \"backgroundColor\": \"#117a65\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 32}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(44, 7, 'text', 4, '{\"text\": \"Kontakt: 📧 edu@techmarket.pl | ☎️ +48 22 555 44 33\", \"color\": \"#7f8c8d\", \"fontSize\": 11, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(45, 8, 'text', 0, '{\"text\": \"{\\\"id\\\":\\\"newsletter-basic\\\",\\\"name\\\":\\\"Newsletter Firmowy\\\",\\\"description\\\":\\\"Profesjonalny szablon newslettera z logo, nagłówkiem i stopką\\\",\\\"category\\\":\\\"newsletter\\\",\\\"thumbnail\\\":\\\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjMjE5NkYzIi8+PHJlY3QgeD0iMTAiIHk9IjUwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZTBlMGUwIi8+PHJlY3QgeD0iMTAiIHk9IjgwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZTBlMGUwIi8+PHJlY3QgeD0iMTAiIHk9IjExMCIgd2lkdGg9IjgwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjNGNhZjUwIi8+PC9zdmc+\\\",\\\"file\\\":\\\"newsletter-basic.json\\\",\\\"tags\\\":[\\\"newsletter\\\",\\\"firmowy\\\",\\\"miesięczny\\\"]}\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(46, 8, 'text', 1, '{\"text\": \"{\\\"id\\\":\\\"promo-sale\\\",\\\"name\\\":\\\"Promocja - Wielka Wyprzedaż\\\",\\\"description\\\":\\\"Atrakcyjny szablon promocyjny z dużym rabatem i call-to-action\\\",\\\"category\\\":\\\"promocja\\\",\\\"thumbnail\\\":\\\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlNzRjM2M7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojYzM0MzMzO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZCkiLz48dGV4dCB4PSIxMDAiIHk9IjQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiPi01MCU8L3RleHQ+PHJlY3QgeD0iNTAiIHk9IjYwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjMwIiBmaWxsPSIjZmZmIiByeD0iNSIvPjx0ZXh0IHg9IjEwMCIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNlNzRjM2MiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIj5LVVAgVEVSQVo8L3RleHQ+PC9zdmc+\\\",\\\"file\\\":\\\"promo-sale.json\\\",\\\"tags\\\":[\\\"promocja\\\",\\\"wyprzedaż\\\",\\\"rabat\\\",\\\"ecommerce\\\"]}\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(47, 8, 'text', 2, '{\"text\": \"{\\\"id\\\":\\\"notification-welcome\\\",\\\"name\\\":\\\"Powiadomienie - Powitanie\\\",\\\"description\\\":\\\"Szablon powitalny dla nowych użytkowników lub klientów\\\",\\\"category\\\":\\\"powiadomienie\\\",\\\"thumbnail\\\":\\\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWNmMGYxIi8+PGNpcmNsZSBjeD0iMTAwIiBjeT0iNDAiIHI9IjI1IiBmaWxsPSIjMjdhZTYwIi8+PHRleHQgeD0iMTAwIiB5PSI0NyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMjAiPuKckTwvdGV4dD48dGV4dCB4PSIxMDAiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMmMzZTUwIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+V2l0YWo8L3RleHQ+PHRleHQgeD0iMTAwIiB5PSIxMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM3ZjhjOGQiIGZvbnQtc2l6ZT0iMTAiPkRaw65rdWplbXkgemEgcmVqZXN0cmFjasW5PC90ZXh0PjxyZWN0IHg9IjcwIiB5PSIxMTUiIHdpZHRoPSI2MCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzM0OThkYiIgcng9IjMiLz48dGV4dCB4PSIxMDAiIHk9IjEyOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iOSI+UG9jemF0ZWs8L3RleHQ+PC9zdmc+\\\",\\\"file\\\":\\\"notification-welcome.json\\\",\\\"tags\\\":[\\\"powitanie\\\",\\\"rejestracja\\\",\\\"welcome\\\",\\\"onboarding\\\"]}\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(48, 8, 'text', 3, '{\"text\": \"{\\\"id\\\":\\\"event-invitation\\\",\\\"name\\\":\\\"Zaproszenie na Wydarzenie\\\",\\\"description\\\":\\\"Elegancki szablon zaproszenia na konferencję, webinar lub spotkanie\\\",\\\"category\\\":\\\"wydarzenia\\\",\\\"thumbnail\\\":\\\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNjc0ZWE3IiByeD0iOCIvPjx0ZXh0IHg9IjEwMCIgeT0iMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCI+WkFQUk9TWkVOSUU8L3RleHQ+PGNpcmNsZSBjeD0iNDAiIGN5PSI4NSIgcj0iMTUiIGZpbGw9IiNlNzRjM2MiLz48dGV4dCB4PSI0MCIgeT0iOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEwIj4xNTwvdGV4dD48dGV4dCB4PSI3MCIgeT0iNzgiIGZpbGw9IiMyYzNlNTAiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIj5LT05GRVJFTkNKQTwvdGV4dD48dGV4dCB4PSI3MCIgeT0iOTIiIGZpbGw9IiM3ZjhjOGQiIGZvbnQtc2l6ZT0iMTAiPjE1IExpc3RvcGFkYSAyMDI1PC90ZXh0PjxyZWN0IHg9IjcwIiB5PSIxMDUiIHdpZHRoPSI4MCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzI3YWU2MCIgcng9IjQiLz48dGV4dCB4PSIxMTAiIHk9IjExOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTAiPkRPTMSEQ1o8L3RleHQ+PC9zdmc+\\\",\\\"file\\\":\\\"event-invitation.json\\\",\\\"tags\\\":[\\\"wydarzenie\\\",\\\"konferencja\\\",\\\"zaproszenie\\\",\\\"networking\\\"]}\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(49, 8, 'text', 4, '{\"text\": \"{\\\"id\\\":\\\"education-offer\\\",\\\"name\\\":\\\"Oferta dla szkół i uczelni\\\",\\\"description\\\":\\\"Profesjonalny szablon promujący produkty i rozwiązania dla sektora edukacji.\\\",\\\"category\\\":\\\"promocje\\\",\\\"thumbnail\\\":\\\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWRmMmYwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNDY4YmYyIiByeD0iOCIvPjx0ZXh0IHg9IjEwMCIgeT0iMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCI+RURVQ0FDSU8gMjAyNSA8L3RleHQ+PHJlY3QgeD0iMzAiIHk9IjcwIiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZmZmIiByeD0iOCIgc3Ryb2tlPSIjNDY4YmYyIiBzdHJva2Utd2lkdGg9IjMiLz48dGV4dCB4PSIxMDAiIHk9Ijk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNDY4YmYyIiBmb250LXNpemU9IjEyIj5MYXB0b3AgRWQ8L3RleHQ+PC9zdmc+\\\",\\\"file\\\":\\\"education-offer.json\\\",\\\"tags\\\":[\\\"edukacja\\\",\\\"sprzedaż\\\",\\\"szkoła\\\",\\\"uczelnia\\\",\\\"promocja\\\"]}\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(50, 8, 'text', 5, '{\"text\": \"{\\\"id\\\":\\\"kindergarten-offer\\\",\\\"name\\\":\\\"Oferta dla przedszkoli\\\",\\\"description\\\":\\\"Kolorowy szablon promujący pomoce dydaktyczne i wyposażenie dla najmłodszych.\\\",\\\"category\\\":\\\"promocje\\\",\\\"thumbnail\\\":\\\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmNmNDAwIi8+PHJlY3QgeD0iMzAiIHk9IjQwIiB3aWR0aD0iMTQwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjZmZmIiByeD0iOCIgc3Ryb2tlPSIjZmM4MDAwIiBzdHJva2Utd2lkdGg9IjMiLz48dGV4dCB4PSIxMDAiIHk9IjkwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjZmM4MDAwIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+UHJ6ZWRza29sZTwvdGV4dD48L3N2Zz4=\\\",\\\"file\\\":\\\"kindergarten-offer.json\\\",\\\"tags\\\":[\\\"przedszkole\\\",\\\"zabawki\\\",\\\"edukacja\\\",\\\"promocja\\\"]}\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(51, 8, 'text', 6, '{\"text\": \"{\\\"id\\\":\\\"school-lab-offer\\\",\\\"name\\\":\\\"Laboratoria Szkolne\\\",\\\"description\\\":\\\"Szablon promujący zestawy i sprzęt do laboratoriów szkolnych.\\\",\\\"category\\\":\\\"promocje\\\",\\\"thumbnail\\\":\\\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjZTFlZmYwIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PGNpcmNsZSBjeD0iNjAiIGN5PSI3NSIgcj0iMjUiIGZpbGw9IiM0YmQ0ZjUiLz48dGV4dCB4PSIxMDAiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNDJiNGY1IiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCI+Q2hlbWlhPC90ZXh0Pjwvc3ZnPg==\\\",\\\"file\\\":\\\"school-lab-offer.json\\\",\\\"tags\\\":[\\\"laboratorium\\\",\\\"chemia\\\",\\\"fizyka\\\",\\\"edukacja\\\"]}\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(52, 8, 'text', 7, '{\"text\": \"{\\\"id\\\":\\\"primary-school-tablets\\\",\\\"name\\\":\\\"Oferta dla szkół podstawowych\\\",\\\"description\\\":\\\"Szablon promujący zestawy tabletów edukacyjnych dla szkół podstawowych\\\",\\\"category\\\":\\\"promocje\\\",\\\"thumbnail\\\":\\\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjdiNmYxIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZmY5YjYwIiByeD0iOCIvPjx0ZXh0IHg9IjEwMCIgeT0iMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCI+U0tPTEUgUE9EV0lTIkU8L3RleHQ+PC9zdmc+\\\",\\\"file\\\":\\\"primary-school-tablets.json\\\",\\\"tags\\\":[\\\"edukacja\\\",\\\"szkoła podstawowa\\\",\\\"tablet\\\",\\\"promocja\\\"]}\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(53, 8, 'text', 8, '{\"text\": \"{\\\"id\\\":\\\"highschool-projectors\\\",\\\"name\\\":\\\"Oferta dla liceów i techników\\\",\\\"description\\\":\\\"Szablon promujący projektory interaktywne dla liceów i techników\\\",\\\"category\\\":\\\"promocje\\\",\\\"thumbnail\\\":\\\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjZjYjYwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjYjZjZjYwIiByeD0iOCIvPjx0ZXh0IHg9IjEwMCIgeT0iMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCI+PROJEKTORY INTERAKTYWNE< /dGV4dD48L3N2Zz4=\\\",\\\"file\\\":\\\"highschool-projectors.json\\\",\\\"tags\\\":[\\\"edukacja\\\",\\\"liceum\\\",\\\"projektor\\\",\\\"promocja\\\"]}\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(54, 8, 'text', 9, '{\"text\": \"{\\\"id\\\":\\\"university-software\\\",\\\"name\\\":\\\"Oferta dla uczelni wyższych\\\",\\\"description\\\":\\\"Szablon promujący licencje oprogramowania edukacyjnego dla uczelni\\\",\\\"category\\\":\\\"promocje\\\",\\\"thumbnail\\\":\\\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjNmY4YjYwIi8+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iMTgwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjOWY5YmYyIiByeD0iOCIvPjx0ZXh0IHg9IjEwMCIgeT0iMzUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCI+ LICENCJE OPROGRAMOWANIA EDUKACYJNEGO< /dGV4dD48L3N2Zz4=\\\",\\\"file\\\":\\\"university-software.json\\\",\\\"tags\\\":[\\\"edukacja\\\",\\\"uczelnia\\\",\\\"oprogramowanie\\\",\\\"promocja\\\"]}\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(55, 9, 'text', 0, '{\"text\": \"🧸 OFERTA DLA PRZEDSZKOLI\", \"color\": \"#fc8000\", \"fontSize\": 26, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 16, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(56, 9, 'text', 1, '{\"text\": \"Kolorowe i bezpieczne wyposażenie, które wspiera rozwój i naukę poprzez zabawę.\", \"color\": \"#333333\", \"fontSize\": 18, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(57, 9, 'image', 2, '{\"alt\": \"Zestaw edukacyjny KidsPlay\", \"src\": \"https://via.placeholder.com/500x200/fc8000/ffffff?text=Zestaw+edukacyjny+KidsPlay\", \"url\": \"https://example.com/produkty/zestaw-kidsplay\", \"width\": 500, \"height\": 200, \"borderRadius\": 10}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(58, 9, 'text', 3, '{\"text\": \"🎨 **Zestaw edukacyjny KidsPlay**\\n- Tablica magnetyczna + akcesoria plastyczne\\n- Bezpieczne materiały (certyfikaty CE)\\n- Kolorowe kształty i puzzle sensoryczne\\n\\nCena: **od 899 zł netto/szt.**\", \"color\": \"#333333\", \"fontSize\": 14}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 20}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(59, 9, 'button', 4, '{\"url\": \"https://example.com/produkty/zestaw-kidsplay\", \"text\": \"ZOBACZ PRODUKT\", \"padding\": \"16px 40px\", \"textColor\": \"#ffffff\", \"borderRadius\": 8, \"backgroundColor\": \"#fc8000\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 32}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(60, 9, 'text', 5, '{\"text\": \"📧 Kontakt: edu@edumarket.pl | ☎️ +48 22 111 22 33\\nEdumarket Sp. z o.o. | www.edumarket.pl\", \"color\": \"#7f8c8d\", \"fontSize\": 11}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(61, 10, 'text', 0, '{\"text\": \"🌍 NOWE KURSY JĘZYKOWE 2025 🌍\", \"color\": \"#2980b9\", \"fontSize\": 30, \"fontWeight\": \"bold\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 16}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(62, 10, 'text', 1, '{\"text\": \"Zwiększ kompetencje językowe nauczycieli i uczniów!\", \"color\": \"#2c3e50\", \"fontSize\": 18}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 20}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(63, 10, 'image', 2, '{\"alt\": \"Kurs języka angielskiego\", \"src\": \"https://via.placeholder.com/400x200/2980b9/ffffff?text=Angielski+dla+szkol\", \"url\": \"https://example.com/kurs-angielski\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 12}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(64, 10, 'text', 3, '{\"text\": \"📘 Kurs angielskiego dla szkół – od 59 zł / ucznia\\n📗 Kurs niemieckiego – zniżka 20% do 30 listopada!\", \"color\": \"#16a085\", \"fontSize\": 15}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(65, 10, 'button', 4, '{\"url\": \"https://example.com/oferta-jezykowa\", \"text\": \"ZOBACZ SZCZEGÓŁY\", \"textColor\": \"#ffffff\", \"borderRadius\": 8, \"backgroundColor\": \"#3498db\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 20}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(66, 10, 'text', 5, '{\"text\": \"Oferta ważna do 30 listopada 2025\", \"color\": \"#7f8c8d\", \"fontSize\": 12}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(67, 11, 'image', 0, '{\"alt\": \"Logo firmy\", \"src\": \"https://via.placeholder.com/300x80/2196F3/ffffff?text=LOGO+FIRMY\", \"url\": \"\", \"width\": 300, \"height\": 80, \"borderRadius\": 0}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 32}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(68, 11, 'text', 1, '{\"text\": \"Newsletter - Październik 2025\", \"color\": \"#2c3e50\", \"fontSize\": 28, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(69, 11, 'text', 2, '{\"text\": \"Witaj w naszym miesięcznym newsletterze! Przygotowaliśmy dla Ciebie najważniejsze informacje z naszej firmy, nowości produktowe oraz ekskluzywne oferty.\", \"color\": \"#333333\", \"fontSize\": 16, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(70, 11, 'text', 3, '{\"text\": \"🎉 Nowości tego miesiąca\", \"color\": \"#e74c3c\", \"fontSize\": 22, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 32, \"textAlign\": \"left\", \"marginBottom\": 16}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(71, 11, 'text', 4, '{\"text\": \"• Nowa wersja naszej aplikacji z ulepszonymi funkcjami\\n• Program lojalnościowy dla stałych klientów\\n• Rozszerzona oferta produktów ekologicznych\\n• Nowe partnerstwa biznesowe\", \"color\": \"#333333\", \"fontSize\": 15, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 32}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(72, 11, 'button', 5, '{\"url\": \"https://example.com/nowosci\", \"text\": \"Zobacz więcej nowości\", \"padding\": \"14px 28px\", \"textColor\": \"#ffffff\", \"borderRadius\": 6, \"backgroundColor\": \"#3498db\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 40}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(73, 11, 'spacer', 6, '{\"height\": 30, \"borderRadius\": 0, \"backgroundColor\": \"transparent\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(74, 11, 'text', 7, '{\"text\": \"Dziękujemy za bycie z nami!\\n\\nZespół [Nazwa Firmy]\\nwww.example.com | kontakt@example.com\\n\\nJeśli nie chcesz otrzymywać tych wiadomości, możesz się wypisać.\", \"color\": \"#666666\", \"fontSize\": 12, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(75, 12, 'text', 0, '{\"text\": \"✨ Witamy w naszej społeczności! ✨\", \"color\": \"#27ae60\", \"fontSize\": 24, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 20, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(76, 12, 'text', 1, '{\"text\": \"Dziękujemy za rejestrację w naszym serwisie. Cieszymy się, że do nas dołączyłeś!\", \"color\": \"#2c3e50\", \"fontSize\": 18, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 32}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(77, 12, 'image', 2, '{\"alt\": \"Witaj w zespole\", \"src\": \"https://via.placeholder.com/300x150/27ae60/ffffff?text=WITAJ+W+ZESPOLE\", \"url\": \"\", \"width\": 300, \"height\": 150, \"borderRadius\": 12}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 32}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(78, 12, 'text', 3, '{\"text\": \"Co możesz teraz zrobić?\", \"color\": \"#34495e\", \"fontSize\": 20, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 16}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(79, 12, 'text', 4, '{\"text\": \"🎯 Uzupełnij swój profil\\n📱 Pobierz naszą aplikację mobilną\\n🎁 Skorzystaj z kodu rabatowego WELCOME20\\n📧 Dostosuj ustawienia powiadomień\\n👥 Dołącz do naszej grupy na Facebook\", \"color\": \"#333333\", \"fontSize\": 15, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 32}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(80, 12, 'button', 5, '{\"url\": \"https://example.com/start\", \"text\": \"Rozpocznij przygodę\", \"padding\": \"16px 32px\", \"textColor\": \"#ffffff\", \"borderRadius\": 25, \"backgroundColor\": \"#3498db\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 32}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(81, 12, 'text', 6, '{\"text\": \"💡 Wskazówka: Sprawdzaj regularnie swoją skrzynkę mailową - będziemy wysyłać Ci najlepsze oferty i nowości!\", \"color\": \"#f39c12\", \"fontSize\": 14, \"fontStyle\": \"italic\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 40}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(82, 12, 'spacer', 7, '{\"height\": 2, \"borderRadius\": 0, \"backgroundColor\": \"#bdc3c7\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 20}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(83, 12, 'text', 8, '{\"text\": \"Masz pytania? Skontaktuj się z nami!\\n\\nZespół Obsługi Klienta\\nE-mail: pomoc@example.com\\nTelefon: +48 800 123 456\\n\\n© 2025 Twoja Firma. Wszystkie prawa zastrzeżone.\", \"color\": \"#7f8c8d\", \"fontSize\": 12, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(84, 13, 'text', 0, '{\"text\": \"📚 NOWE TABLETY EDUKACYJNE DLA SZKÓŁ PODSTAWOWYCH\", \"color\": \"#1f618d\", \"fontSize\": 26, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 16, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(85, 13, 'image', 1, '{\"alt\": \"Tablety edukacyjne\", \"src\": \"https://via.placeholder.com/500x200/1f618d/ffffff?text=Tablety+Edukacyjne\", \"url\": \"https://example.com/produkty/tablet-edukacyjny\", \"width\": 500, \"height\": 200, \"borderRadius\": 10}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(86, 13, 'text', 2, '{\"text\": \"Tablet EduKid 10\\\" – idealny do nauki w klasie i zdalnie\\n- Wytrzymała konstrukcja\\n- Kontrola rodzicielska i edukacyjne aplikacje\\n- Cena specjalna dla szkół: **od 899 zł/szt.**\", \"color\": \"#1f618d\", \"fontSize\": 14, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(87, 13, 'button', 3, '{\"url\": \"https://example.com/produkty/tablet-edukacyjny\", \"text\": \"ZOBACZ OFERTĘ\", \"padding\": \"16px 40px\", \"textColor\": \"#ffffff\", \"borderRadius\": 8, \"backgroundColor\": \"#1f618d\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 32}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(88, 13, 'text', 4, '{\"text\": \"Skontaktuj się: 📧 edu@techmarket.pl | ☎️ +48 22 555 44 33\", \"color\": \"#7f8c8d\", \"fontSize\": 11, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(89, 14, 'text', 0, '{\"text\": \"🔥 WIELKA WYPRZEDAŻ 🔥\", \"color\": \"#e74c3c\", \"fontSize\": 32, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 20, \"textAlign\": \"center\", \"marginBottom\": 16}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(90, 14, 'text', 1, '{\"text\": \"DO -50% ZNIŻKI\", \"color\": \"#c0392b\", \"fontSize\": 48, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(91, 14, 'text', 2, '{\"text\": \"Tylko przez ograniczony czas!\", \"color\": \"#2c3e50\", \"fontSize\": 20, \"fontStyle\": \"italic\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 32}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(92, 14, 'image', 3, '{\"alt\": \"Produkty w promocji\", \"src\": \"https://via.placeholder.com/400x200/f39c12/ffffff?text=PRODUKTY+W+PROMOCJI\", \"url\": \"https://example.com/promocja\", \"width\": 400, \"height\": 200, \"borderRadius\": 8}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 32}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(93, 14, 'text', 4, '{\"text\": \"✅ Setki produktów w promocyjnych cenach\\n✅ Darmowa dostawa od 100 zł\\n✅ 30 dni na zwrot\\n✅ Gwarancja najniższej ceny\", \"color\": \"#27ae60\", \"fontSize\": 16, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 32}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(94, 14, 'button', 5, '{\"url\": \"https://example.com/promocje\", \"text\": \"ZOBACZ PROMOCJE\", \"padding\": \"18px 36px\", \"textColor\": \"#ffffff\", \"borderRadius\": 8, \"backgroundColor\": \"#e74c3c\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(95, 14, 'text', 6, '{\"text\": \"⏰ Promocja ważna do 31 października 2025\", \"color\": \"#e67e22\", \"fontSize\": 14, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 40}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(96, 14, 'spacer', 7, '{\"height\": 20, \"borderRadius\": 0, \"backgroundColor\": \"#ecf0f1\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(97, 14, 'text', 8, '{\"text\": \"Sklep Online\\nul. Przykładowa 123, 00-001 Warszawa\\nTel: +48 123 456 789\\n\\nWypisz się z newslettera | Polityka prywatności\", \"color\": \"#7f8c8d\", \"fontSize\": 11, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 16, \"textAlign\": \"center\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(98, 15, 'text', 0, '{\"text\": \"🔬 NOWOCZESNE LABORATORIA SZKOLNE\", \"color\": \"#2c3e50\", \"fontSize\": 26, \"fontWeight\": \"bold\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(99, 15, 'text', 1, '{\"text\": \"Stwórz profesjonalne środowisko nauki dzięki wyposażeniu chemicznemu i fizycznemu nowej generacji.\", \"color\": \"#34495e\", \"fontSize\": 18}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(100, 15, 'image', 2, '{\"alt\": \"Zestaw ChemLab Pro\", \"src\": \"https://via.placeholder.com/500x200/4bd4f5/ffffff?text=Zestaw+ChemLab+Pro\", \"url\": \"https://example.com/produkty/chemlab-pro\", \"borderRadius\": 10}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(101, 15, 'text', 3, '{\"text\": \"⚗️ **Zestaw ChemLab Pro**\\n- 25 elementów laboratoryjnych\\n- Bezpieczne szkło borokrzemowe\\n- Idealny do doświadczeń szkolnych\\n\\nCena edukacyjna: **od 1299 zł netto/szt.**\", \"color\": \"#2c3e50\", \"fontSize\": 14}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 20}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(102, 15, 'button', 4, '{\"url\": \"https://example.com/produkty/chemlab-pro\", \"text\": \"SPRAWDŹ SZCZEGÓŁY\", \"padding\": \"16px 40px\", \"textColor\": \"#ffffff\", \"borderRadius\": 8, \"backgroundColor\": \"#4bd4f5\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 32}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(103, 15, 'text', 5, '{\"text\": \"📧 Kontakt: sales@edulabs.pl | ☎️ +48 22 321 00 44\\nEduLabs Polska | www.edulabs.pl\", \"color\": \"#7f8c8d\", \"fontSize\": 11}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(104, 17, 'text', 0, '{\"text\": \"💻 LICENCJE OPROGRAMOWANIA EDUKACYJNEGO DLA UCZELNI WYŻSZYCH\", \"color\": \"#8e44ad\", \"fontSize\": 26, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 16, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(105, 17, 'text', 1, '{\"text\": \"Oferujemy dostęp do profesjonalnych narzędzi edukacyjnych i naukowych dla studentów i wykładowców.\", \"color\": \"#34495e\", \"fontSize\": 18, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(106, 17, 'image', 2, '{\"alt\": \"Oprogramowanie edukacyjne\", \"src\": \"https://via.placeholder.com/500x200/8e44ad/ffffff?text=Oprogramowanie+Edukacyjne\", \"url\": \"https://example.com/produkty/licencje-software\", \"width\": 500, \"height\": 200, \"borderRadius\": 10}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(107, 17, 'text', 3, '{\"text\": \"Licencja EduSoft Pro – dostęp do narzędzi do analizy danych, modelowania 3D i symulacji\\n- Licencja roczna dla uczelni\\n- Indywidualny panel zarządzania\\n- Cena specjalna: **od 1999 zł/rok**\", \"color\": \"#8e44ad\", \"fontSize\": 14, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 24}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(108, 17, 'button', 4, '{\"url\": \"https://example.com/produkty/licencje-software\", \"text\": \"ZOBACZ OFERTĘ\", \"padding\": \"16px 40px\", \"textColor\": \"#ffffff\", \"borderRadius\": 8, \"backgroundColor\": \"#8e44ad\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 32}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(109, 17, 'text', 5, '{\"text\": \"Kontakt: 📧 edu@techmarket.pl | ☎️ +48 22 555 44 33\", \"color\": \"#7f8c8d\", \"fontSize\": 11, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 0}', '2025-10-31 20:55:18', '2025-10-31 20:55:18', 1, NULL),
(110, 18, 'text', 0, '{\"text\": \"🔥 WIELKA WYPRZEDAŻ 🔥\", \"color\": \"#e74c3c\", \"fontSize\": 32, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 20, \"textAlign\": \"center\", \"marginBottom\": 16}', '2025-10-31 22:31:43', '2025-10-31 22:31:43', 1, NULL),
(111, 18, 'text', 1, '{\"text\": \"DO -50% ZNIŻKI\", \"color\": \"#c0392b\", \"fontSize\": 48, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 22:31:43', '2025-10-31 22:31:43', 1, NULL),
(112, 18, 'text', 2, '{\"text\": \"Tylko przez ograniczony czas!\", \"color\": \"#2c3e50\", \"fontSize\": 20, \"fontStyle\": \"italic\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 32}', '2025-10-31 22:31:43', '2025-10-31 22:31:43', 1, NULL),
(113, 18, 'image', 3, '{\"alt\": \"Produkty w promocji\", \"src\": \"https://via.placeholder.com/400x200/f39c12/ffffff?text=PRODUKTY+W+PROMOCJI\", \"url\": \"https://example.com/promocja\", \"width\": 400, \"height\": 200, \"borderRadius\": 8}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 32}', '2025-10-31 22:31:43', '2025-10-31 22:31:43', 1, NULL),
(114, 18, 'text', 4, '{\"text\": \"✅ Setki produktów w promocyjnych cenach\\n✅ Darmowa dostawa od 100 zł\\n✅ 30 dni na zwrot\\n✅ Gwarancja najniższej ceny\", \"color\": \"#27ae60\", \"fontSize\": 16, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 0, \"textAlign\": \"left\", \"marginBottom\": 32}', '2025-10-31 22:31:43', '2025-10-31 22:31:43', 1, NULL),
(115, 18, 'button', 5, '{\"url\": \"https://example.com/promocje\", \"text\": \"ZOBACZ PROMOCJE\", \"padding\": \"18px 36px\", \"textColor\": \"#ffffff\", \"borderRadius\": 8, \"backgroundColor\": \"#e74c3c\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 24}', '2025-10-31 22:31:43', '2025-10-31 22:31:43', 1, NULL),
(116, 18, 'text', 6, '{\"text\": \"⏰ Promocja ważna do 31 października 2025\", \"color\": \"#e67e22\", \"fontSize\": 14, \"fontStyle\": \"normal\", \"fontWeight\": \"bold\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 40}', '2025-10-31 22:31:43', '2025-10-31 22:31:43', 1, NULL),
(117, 18, 'spacer', 7, '{\"height\": 20, \"borderRadius\": 0, \"backgroundColor\": \"#ecf0f1\"}', '{\"marginTop\": 0, \"textAlign\": \"center\", \"marginBottom\": 0}', '2025-10-31 22:31:43', '2025-10-31 22:31:43', 1, NULL),
(118, 18, 'text', 8, '{\"text\": \"Sklep Online\\nul. Przykładowa 123, 00-001 Warszawa\\nTel: +48 123 456 789\\n\\nWypisz się z newslettera | Polityka prywatności\", \"color\": \"#7f8c8d\", \"fontSize\": 11, \"fontStyle\": \"normal\", \"fontWeight\": \"normal\"}', '{\"marginTop\": 16, \"textAlign\": \"center\", \"marginBottom\": 0}', '2025-10-31 22:31:43', '2025-10-31 22:31:43', 1, NULL);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users`
--

CREATE TABLE `users` (
  `email` varchar(255) NOT NULL,
  `hash` varchar(255) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL COMMENT 'Imię i nazwisko użytkownika',
  `active` tinyint(1) DEFAULT 1 COMMENT 'Status aktywności konta (1=aktywne, 0=nieaktywne)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Zrzut danych tabeli `users`
--

INSERT INTO `users` (`email`, `hash`, `customer_id`, `name`, `active`, `created_at`, `last_login`, `updated_at`) VALUES
('verx@verx.pl', '$2b$10$8OIYyontVvWBvsPctdOtKuvWA7kSsHJXhGuufsCQnRmatK5.h/uZK', 1, NULL, 1, '2026-10-05 18:22:48', '2026-10-05 18:23:49', '2026-10-05 18:23:49');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `user_roles`
--

CREATE TABLE `user_roles` (
  `id` int(11) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `assigned_by` varchar(255) DEFAULT NULL COMMENT 'Email użytkownika który przypisał rolę'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `campaign_replies`
--
ALTER TABLE `campaign_replies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_campaign_replies_marketing_campanies` (`campaign_id`),
  ADD KEY `FK_campaign_replies_mail_addresses` (`mail_address_id`),
  ADD KEY `idx_campaign_replies_is_read` (`is_read`) USING BTREE,
  ADD KEY `idx_campaign_replies_is_bounce` (`is_bounce`) USING BTREE;

--
-- Indeksy dla tabeli `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `customer_databases`
--
ALTER TABLE `customer_databases`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `email_templates`
--
ALTER TABLE `email_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_templates_category` (`category`),
  ADD KEY `idx_templates_customer` (`customerId`),
  ADD KEY `idx_templates_system` (`isSystem`),
  ADD KEY `idx_templates_public` (`isPublic`),
  ADD KEY `idx_templates_deleted` (`deletedAt`),
  ADD KEY `idx_templates_author` (`author`),
  ADD KEY `idx_email_templates_category` (`category`),
  ADD KEY `idx_email_templates_customer` (`customerId`),
  ADD KEY `idx_email_templates_active` (`isActive`),
  ADD KEY `idx_email_templates_public` (`isPublic`),
  ADD KEY `idx_email_templates_usage` (`usageCount`,`lastUsedAt`);

--
-- Indeksy dla tabeli `mail_addresses`
--
ALTER TABLE `mail_addresses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bduniq` (`mail_address`,`database_id`),
  ADD KEY `idx_mail_address` (`mail_address`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_active` (`active`),
  ADD KEY `idx_mail_addresses_bounce_date` (`bounce_date`) USING BTREE;

--
-- Indeksy dla tabeli `mail_address_attributes_definitions`
--
ALTER TABLE `mail_address_attributes_definitions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customer_id` (`customer_id`);

--
-- Indeksy dla tabeli `mail_address_attribute_value`
--
ALTER TABLE `mail_address_attribute_value`
  ADD PRIMARY KEY (`mail_address_attributes_definitions_id`,`mail_addresses_id`),
  ADD KEY `mail_addresses_id` (`mail_addresses_id`);

--
-- Indeksy dla tabeli `marketing_campanies`
--
ALTER TABLE `marketing_campanies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_active` (`active`),
  ADD KEY `idx_marketing_campaigns_reply_active` (`reply_check_enabled`,`active`,`sent`),
  ADD KEY `idx_marketing_campanies_smtp_host` (`smtp_host`);

--
-- Indeksy dla tabeli `marketing_campanies_mailing_result`
--
ALTER TABLE `marketing_campanies_mailing_result`
  ADD PRIMARY KEY (`marketing_campanies_id`,`mail_addresses_id`),
  ADD KEY `mail_addresses_id` (`mail_addresses_id`),
  ADD KEY `idx_is_send` (`is_send`),
  ADD KEY `idx_is_readed` (`is_readed`),
  ADD KEY `idx_mcmr_message_id` (`message_id`),
  ADD KEY `idx_mcmr_error` (`error`) USING BTREE,
  ADD KEY `idx_mcmr_send_error_type` (`send_error_type`) USING BTREE;

--
-- Indeksy dla tabeli `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_password_reset_tokens_token_hash` (`token_hash`),
  ADD KEY `idx_password_reset_tokens_user_email` (`user_email`),
  ADD KEY `idx_password_reset_tokens_expires_at` (`expires_at`);

--
-- Indeksy dla tabeli `permission`
--
ALTER TABLE `permission`
  ADD PRIMARY KEY (`id`),
  ADD KEY `permission_objects_id` (`permission_objects_id`),
  ADD KEY `permission_function_id` (`permission_function_id`),
  ADD KEY `idx_customer_id` (`customer_id`);

--
-- Indeksy dla tabeli `permission_function`
--
ALTER TABLE `permission_function`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `permission_objects`
--
ALTER TABLE `permission_objects`
  ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`);

--
-- Indeksy dla tabeli `template_blocks`
--
ALTER TABLE `template_blocks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_template_block_order` (`templateId`,`blockOrder`),
  ADD KEY `idx_blocks_template` (`templateId`),
  ADD KEY `idx_blocks_type` (`blockType`),
  ADD KEY `idx_blocks_order` (`templateId`,`blockOrder`),
  ADD KEY `idx_template_blocks_template` (`templateId`),
  ADD KEY `idx_template_blocks_order` (`templateId`,`blockOrder`),
  ADD KEY `idx_template_blocks_type` (`blockType`),
  ADD KEY `idx_template_blocks_active` (`isActive`);

--
-- Indeksy dla tabeli `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`email`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_active` (`active`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indeksy dla tabeli `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_role` (`user_email`,`role_id`),
  ADD KEY `idx_user_email` (`user_email`),
  ADD KEY `idx_role_id` (`role_id`);

--
-- AUTO_INCREMENT dla tabel zrzutów
--

--
-- AUTO_INCREMENT dla tabeli `campaign_replies`
--
ALTER TABLE `campaign_replies`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT dla tabeli `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT dla tabeli `customer_databases`
--
ALTER TABLE `customer_databases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT dla tabeli `email_templates`
--
ALTER TABLE `email_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT dla tabeli `mail_addresses`
--
ALTER TABLE `mail_addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30034;

--
-- AUTO_INCREMENT dla tabeli `mail_address_attributes_definitions`
--
ALTER TABLE `mail_address_attributes_definitions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT dla tabeli `marketing_campanies`
--
ALTER TABLE `marketing_campanies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT dla tabeli `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT dla tabeli `permission`
--
ALTER TABLE `permission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT dla tabeli `permission_function`
--
ALTER TABLE `permission_function`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT dla tabeli `permission_objects`
--
ALTER TABLE `permission_objects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT dla tabeli `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT dla tabeli `template_blocks`
--
ALTER TABLE `template_blocks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=119;

--
-- AUTO_INCREMENT dla tabeli `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Ograniczenia dla zrzutów tabel
--

--
-- Ograniczenia dla tabeli `campaign_replies`
--
ALTER TABLE `campaign_replies`
  ADD CONSTRAINT `FK_campaign_replies_mail_addresses` FOREIGN KEY (`mail_address_id`) REFERENCES `mail_addresses` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_campaign_replies_marketing_campanies` FOREIGN KEY (`campaign_id`) REFERENCES `marketing_campanies` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Ograniczenia dla tabeli `email_templates`
--
ALTER TABLE `email_templates`
  ADD CONSTRAINT `email_templates_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Ograniczenia dla tabeli `mail_addresses`
--
ALTER TABLE `mail_addresses`
  ADD CONSTRAINT `mail_addresses_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Ograniczenia dla tabeli `mail_address_attributes_definitions`
--
ALTER TABLE `mail_address_attributes_definitions`
  ADD CONSTRAINT `mail_address_attributes_definitions_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Ograniczenia dla tabeli `mail_address_attribute_value`
--
ALTER TABLE `mail_address_attribute_value`
  ADD CONSTRAINT `mail_address_attribute_value_ibfk_1` FOREIGN KEY (`mail_address_attributes_definitions_id`) REFERENCES `mail_address_attributes_definitions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mail_address_attribute_value_ibfk_2` FOREIGN KEY (`mail_addresses_id`) REFERENCES `mail_addresses` (`id`) ON DELETE CASCADE;

--
-- Ograniczenia dla tabeli `marketing_campanies`
--
ALTER TABLE `marketing_campanies`
  ADD CONSTRAINT `marketing_campanies_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Ograniczenia dla tabeli `marketing_campanies_mailing_result`
--
ALTER TABLE `marketing_campanies_mailing_result`
  ADD CONSTRAINT `marketing_campanies_mailing_result_ibfk_1` FOREIGN KEY (`marketing_campanies_id`) REFERENCES `marketing_campanies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `marketing_campanies_mailing_result_ibfk_2` FOREIGN KEY (`mail_addresses_id`) REFERENCES `mail_addresses` (`id`) ON DELETE CASCADE;

--
-- Ograniczenia dla tabeli `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `fk_password_reset_tokens_user_email` FOREIGN KEY (`user_email`) REFERENCES `users` (`email`) ON DELETE CASCADE;

--
-- Ograniczenia dla tabeli `permission`
--
ALTER TABLE `permission`
  ADD CONSTRAINT `permission_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `permission_ibfk_2` FOREIGN KEY (`permission_objects_id`) REFERENCES `permission_objects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `permission_ibfk_3` FOREIGN KEY (`permission_function_id`) REFERENCES `permission_function` (`id`) ON DELETE CASCADE;

--
-- Ograniczenia dla tabeli `template_blocks`
--
ALTER TABLE `template_blocks`
  ADD CONSTRAINT `template_blocks_ibfk_1` FOREIGN KEY (`templateId`) REFERENCES `email_templates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ograniczenia dla tabeli `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL;

--
-- Ograniczenia dla tabeli `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_email`) REFERENCES `users` (`email`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
