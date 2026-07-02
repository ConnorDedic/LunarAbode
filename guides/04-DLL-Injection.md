# Dynamic Link Library (DLL) Injection

## DLL Basics
- Windows shared libraries loaded at runtime
- Functions exported for use by other programs
- Can be injected into running processes
- Default search path: App dir → System → Windows\System32

## Injection Techniques
- CreateRemoteThread - Inject via thread creation
- SetWindowsHookEx - Hook window messages
- DLL Preloading - Replace legitimate DLL
- Reflective Injection - Load from memory, no file
- Process Hollowing - Replace process memory
