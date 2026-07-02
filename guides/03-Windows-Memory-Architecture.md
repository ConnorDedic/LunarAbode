# Windows Memory Architecture

## Virtual Address Space (32-bit)
- 0x00000000 - 0x0000FFFF - User Mode (user applications)
- 0x00400000 - Application Base (code loaded here by default)
- 0x7FFFFFFF - Top of user mode
- 0x80000000 - 0xFFFFFFFF - Kernel Mode (OS kernel)

## Memory Regions
- Heap - Dynamic memory allocation (malloc/new)
- Stack - Local variables, function parameters, return addresses
- Text Segment - Read-only code section
- Data Segment - Initialized global/static variables
- BSS Segment - Uninitialized global/static variables
