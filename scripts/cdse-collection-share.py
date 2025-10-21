import requests

# paste the auth token from Browser here (has to be from a support or root account)
token = "ACCESS_TOKEN_FROM_BROWSER"

CCM_VHR_IMAGE_2018 = "4ab2c8f6-ef9e-4989-9c2e-3fae9c88da1e"
CCM_VHR_IMAGE_2021 = "0c96598b-edb2-4a5b-afb0-4d35389ba098"

with open("./scripts/cdse-users.txt") as file:
    users = [line.rstrip() for line in file]

    collections = [CCM_VHR_IMAGE_2018, CCM_VHR_IMAGE_2021]

    for i, user in enumerate(users):
        getuserurl = f"https://sh.dataspace.copernicus.eu/ims/users/{user}/projects"
        headers = {"Authorization": f"Bearer {token}"}
        userres = requests.get(getuserurl, headers=headers)
        if not userres.json():
            print(f"\tuser {user} doesn't exist, skipping")
            continue
        project_id = userres.json()[0]["id"]
        for collection in collections:
            share_collection_url = f'https://sh.dataspace.copernicus.eu/api/v1/acl/collection/{collection}/da/{project_id}/USE'
            shareres = requests.post(share_collection_url, headers=headers)
        print(f"{len(collections)} collections shared with {user}, {i+1}/{len(users)}")
    
    print("done")
