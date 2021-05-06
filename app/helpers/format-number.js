import numeral from "numeral";
import { isArray } from "@ember/array";
import { helper as buildHelper } from "@ember/component/helper";

export function formatNumber(params, hash) {
  let { format } = hash || {};
  let number = params;

  if (isArray(params)) {
    number = params[0];
  }

  if (typeof number === "undefined") {
    number = null;
  }

  if (isNaN(number)) {
    number = null;
  }

  return numeral(number).format(format);
}

export default buildHelper(formatNumber);
