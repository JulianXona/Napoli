#!/bin/bash
cd "$(dirname "$0")"
echo "Abriendo en http://localhost:8000 ..."
open "http://localhost:8000"
python3 -m http.server 8000
