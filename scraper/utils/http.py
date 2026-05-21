import time
import requests
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from config import HEADERS, REQUEST_DELAY_SECONDS, MAX_RETRIES


_session = requests.Session()
_session.headers.update(HEADERS)


@retry(
    stop=stop_after_attempt(MAX_RETRIES),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((requests.ConnectionError, requests.Timeout)),
    reraise=True,
)
def get(url: str, **kwargs) -> requests.Response:
    time.sleep(REQUEST_DELAY_SECONDS)
    resp = _session.get(url, timeout=30, **kwargs)
    resp.raise_for_status()
    return resp


def get_bytes(url: str) -> bytes:
    resp = get(url)
    return resp.content
