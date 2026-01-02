#!/bin/bash
echo "Launching de-X-term by ktxm999..."
mkdir -p data/{bitcoin,litecoin,dogecoin,monero}
docker-compose up -d
echo "Done! Visit http://$(hostname -I | awk '{print $1}'):8080"
