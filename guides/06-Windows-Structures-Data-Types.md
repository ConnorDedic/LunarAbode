# Windows Structures & Data Types

## Common Structures
- PROCESS_INFORMATION - Process handle, thread handle, IDs
- STARTUPINFO - Console window properties
- CONTEXT - CPU registers and state
- MEMORY_BASIC_INFORMATION - Memory region information
- MODULEENTRY32 - Loaded module information

## Calling Conventions
- __cdecl - C default (params right-to-left on stack)
- __stdcall - Windows API (params right-to-left on stack)
- __fastcall - Params in registers (ECX, EDX then stack)
- __thiscall - C++ member functions (ECX = this pointer)
