#!/bin/bash

# Load .env file
if [[ -f ".env" ]]; then
  source .env
else
  echo "Error: .env file not found."
  exit 1
fi

required_vars=("WEBDEV_FTP_USERNAME" "WEBDEV_FTP_PASSWORD" "WEBDEV_FTP_HOST" "CDAS_OTC_FTP_USERNAME" "CDAS_OTC_FTP_PASSWORD" "CDAS_OTC_FTP_HOST")

# Check if all required variables are set
for var in "${required_vars[@]}"; do
  if [[ -z "${!var}" ]]; then
    echo "Error: $var is not set."
    exit 1
  fi
done

source_path="/cdse-browser/build/otc/latest"
target_path="browser"
temp_local_path="deploy/otc"

rm -rf "$temp_local_path"
mkdir -p "$temp_local_path"


echo "Download from source to local"
lftp -e "mirror --delete-first $source_path $temp_local_path ; exit" -u $WEBDEV_FTP_USERNAME,$WEBDEV_FTP_PASSWORD $WEBDEV_FTP_HOST
mirror_exit_code=$?

if [ $mirror_exit_code -eq 1 ]; then
  echo "Error: Source folder $source_path does not exist."
  exit 1
fi


echo "Upload from local to target"
lftp -e "set mirror:parallel-transfer-count 4; mirror -R --delete --overwrite $temp_local_path $target_path ; exit" -u $CDAS_OTC_FTP_USERNAME,$CDAS_OTC_FTP_PASSWORD $CDAS_OTC_FTP_HOST

rm -rf "$temp_local_path"
echo "Deployment completed"
