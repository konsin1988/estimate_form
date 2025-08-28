from dotenv import load_dotenv
import os
import base64
from Crypto.Cipher import AES
from urllib.parse import unquote

def get_sum(est_amount, hcl_amount, contr_amount):
    est_am_value = est_amount if est_amount else 0
    hcl_am_value = hcl_amount if hcl_amount else 0
    contr_am_value = contr_amount if contr_amount else 0
    return est_am_value + hcl_am_value + contr_am_value

def decrypt_param(encrypted_b64_uri: str) -> str:
    load_dotenv()
    SECRET_KEY = os.getenv("ENCRYPT_KEY").encode()
    IV = os.getenv("IV").encode()
    encrypted_b64 = unquote(encrypted_b64_uri)
    encrypted_bytes = base64.b64decode(encrypted_b64)
    cipher = AES.new(SECRET_KEY, AES.MODE_CBC, IV)
    decrypted = cipher.decrypt(encrypted_bytes)

    pad_len = decrypted[-1]
    decrypted = decrypted[:-pad_len]

    return decrypted.decode("utf-8")
