import datetime
import json
import os
import subprocess
import time

CANARY_PATH = "data/canary.json"
TMP_JSON = "data/canary.tmp.json"
TMP_SIG = "data/canary.sig"
data = {
    "message": "BB has not received any FISA warrants, NSA letters, subpoenas, or gag orders."
}


def get_date():
    now = datetime.datetime.now(datetime.timezone.utc)
    data["published"] = now.strftime("%Y-%m-%d")
    data["timestamp"] = time.time()



def sign_json():
    with open(TMP_JSON, "w") as f:
        json.dump(data, f, separators=(",", ":"))
    subprocess.run([
        "gpg",
        "--batch",
        "--yes",
        "--pinentry-mode", "loopback",
        "--passphrase", os.getenv("GPG_PASSPHRASE", ""),
        "--armor",
        "--output", "data/canary.sig",
        "--detach-sign", TMP_JSON
    ], check=True)


def get_signer_info():
    result = subprocess.run(
        ["gpg", "--list-secret-keys", "--with-colons", "--fingerprint"],
        capture_output=True, text=True, check=True
    )

    uid = None
    key_id = None
    fingerprint = None

    for line in result.stdout.splitlines():
        parts = line.strip().split(":")
        if parts[0] == "sec":
            key_id = parts[4][-8:]
        elif parts[0] == "fpr":
            fingerprint = parts[9]
        elif parts[0] == "uid" and not uid:
            uid = parts[9]

    if key_id and fingerprint and uid:
        with open("data/fingerprint.txt", "w") as fh:
            fh.write(fingerprint)
        with open("data/uid.txt", "w") as fh:
            fh.write(uid)
        data["signed_by"] = {
            "uid": uid,
            "key_id": key_id,
            "fingerprint": fingerprint
        }


def save_canary():
    with open(CANARY_PATH, "w") as f:
        json.dump(data, f, indent=4)


if __name__ == "__main__":
    data["enabled"] = True
    get_date()
    sign_json()
    get_signer_info()
    save_canary()
