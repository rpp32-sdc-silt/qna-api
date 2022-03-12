import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter } from 'k6/metrics';

export let options = {
  vus: 500,
  duration: '30s',
};

export default function () {
  var id = Math.floor(Math.random() * 1000012);
  const url = `http://localhost:8080/qa/questions?product_id=${id}`
  // const payload = JSON.stringify({
  //   page: 1,
  //   count: 5
  // });

  const res = http.get(url);
  check(res, {
    'is status 200': (r) => r.status == 200
  });
  sleep(1);
};