SERVICE_NAME=DiscordMusicBot
SOURCE_DIR=src/App.ts
PID_PATH_NAME=/home/opc/server/DiscordMusicBot/server.pid
COMMAND=(forever --pidFile "$PID_PATH_NAME" start -a -l /dev/null -c ts-node "$SOURCE_DIR")

case $1 in
start)
    echo "Starting $SERVICE_NAME ..."
    "${COMMAND[@]}"
    echo "$SERVICE_NAME started..."
    ;;
stop)
    forever stop "$(cat "$PID_PATH_NAME")"
    ;;
restart)
    forever restart $SOURCE_DIR
    ;;
esac
