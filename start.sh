
NOW=$(date +"%Y%b%d")
FILE="/home/ubuntu/gdc-docs/logs/$NOW.gitdoc.log"
ERROR="$FILE.error"

sudo forever start  -o $FILE -e $ERROR app.js

