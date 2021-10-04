SERVICE_NAME=DiscordMusicBot
SOURCE_DIR=dist/src/App.js
#SOURCE_DIR=src/App.ts
PID_PATH_NAME=/home/opc/server/DiscordMusicBot/server.pid
COMMAND=(forever --pidFile "$PID_PATH_NAME" start -a -l /dev/null "$SOURCE_DIR")
#COMMAND=(forever --pidFile "$PID_PATH_NAME" start -a -l /dev/null -c ts-node "$SOURCE_DIR")

case $1 in
start)
    echo "Running project build..."
    tsc
    echo "Starting $SERVICE_NAME ..."
    "${COMMAND[@]}"
    echo "$SERVICE_NAME started..."
    forever list
    ;;
stop)
    forever stop "$(cat "$PID_PATH_NAME")"
    echo "$SERVICE_NAME stopped..."
    forever list
    ;;
restart)
    echo "Running project build..."
    tsc
    echo "restarting $SERVICE_NAME..."
    forever restart $SOURCE_DIR
    forever list
    ;;
esac
