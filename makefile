build:
    docker build -t repeater:latest .
run:
    docker run -d --name repeater repeater:latest
rm:
    docker rm -f repeater
rmi:
    docker rmi -f repeater:latest
restart:
    make rm
    make rmi
    make build
    make run
    echo Успешно перезапущено!