import requests

url = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"

payload={
  'scope': 'GIGACHAT_API_PERS'
}
headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Accept': 'application/json',
  'RqUID': '7ad20a4a-ee8d-4780-9062-3fdd71c3d533',
  'Authorization': 'Basic <Authorization key>'
}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.text)