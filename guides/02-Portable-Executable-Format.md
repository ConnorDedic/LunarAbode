# Portable Executable (PE) Format

## PE Structure Overview
- DOS Header - DOS MZ signature and stub program
- PE Signature - "PE\0\0" - Marks start of actual PE
- File Header - Machine type, # of sections, timestamp
- Optional Header - Entry point, image base, subsystem
- Section Headers - Define sections (.text, .data, .reloc, etc)
- Sections - Actual program code and data

## Key Sections
- .text - Executable code and readonly data
- .data - Initialized global/static variables
- .reloc - Relocation information
- .rsrc - Resource data (icons, dialogs, etc)
