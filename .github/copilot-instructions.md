# Copilot Instructions

All commit messages must:

- Be written in Spanish.
- Follow Conventional Commits format.
- Be short, clear, and written in imperative mood.
- Not contain English words.
- Have a maximum of 72 characters in the title.
- Not end the title with a period.

Required format:

<type>(optional-scope): <short description>

Allowed types:

feat: New feature  
fix: Bug fix  
refactor: Code refactoring (no functional changes)  
perf: Performance improvement  
style: Formatting/style changes (no logic changes)  
docs: Documentation changes  
test: Adding or modifying tests  
chore: Maintenance/internal tasks  
build: Build system or dependency changes  
ci: Continuous integration changes  

Valid examples:

feat: agregar conversión de gif a mp4  
fix: corregir manejo de archivos temporales  
refactor(core): simplificar lógica de procesamiento  
perf: optimizar lectura de archivos  
docs: actualizar instrucciones de instalación  

If the change is complex, include an optional body separated by a blank line:

fix: corregir fuga de memoria en procesamiento

Se libera correctamente el buffer después de convertir el archivo.
Se agrega limpieza segura en bloque finally.
