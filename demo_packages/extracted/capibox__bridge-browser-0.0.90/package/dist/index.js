"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var index_exports = {};
__export(index_exports, {
  browser: () => browser
});
module.exports = __toCommonJS(index_exports);

// src/lib/api.ts
var import_openapi_fetch = __toESM(require("openapi-fetch"));
var endpoint = "/api-client-proxy";
var $apiClient = (0, import_openapi_fetch.default)({
  baseUrl: endpoint,
  headers: {
    "project-key": "Frontend"
  }
});

// src/browser/mail/send-to-recipient.ts
var sendToRecipient = (data) => __async(null, null, function* () {
  const res = yield $apiClient.POST(
    "/mail/send-to-recipient",
    {
      params: {
        header: {
          "project-key": "Frontend"
        }
      },
      body: data
    }
  );
  if (!res.data) {
    throw new Error(res.error);
  }
  return res.data;
});

// src/browser/mail/send-to-support.ts
var sendToSupport = (data) => __async(null, null, function* () {
  const res = yield $apiClient.POST(
    "/mail/send-to-support",
    {
      params: {
        header: {
          "project-key": "Frontend"
        }
      },
      body: data
    }
  );
  if (!res.data) {
    throw new Error(res.error);
  }
  return res.data;
});

// src/browser/session/append.ts
var appendSession = (uuid, body) => __async(null, null, function* () {
  const res = yield $apiClient.PUT(
    "/session/{uuid}",
    {
      params: {
        path: {
          uuid
        },
        header: {
          "project-key": "Frontend"
        }
      },
      body
    }
  );
  if (!res.data) {
    throw new Error("Failed to append session.");
  }
  return res.data.data;
});

// src/browser/_utils/browser-get-cookie.ts
var getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const res = parts.pop();
    if (res) {
      return res.split(";").shift();
    }
  }
  return "";
};

// src/browser/session/create.ts
var createSession = (_a) => __async(null, null, function* () {
  var _b = _a, { language, email, currency, quiz } = _b, data = __objRest(_b, ["language", "email", "currency", "quiz"]);
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  const cookies = window.document.cookie;
  const referer = window.document.referrer;
  const origin = window.location.origin;
  const slug = window.location.pathname;
  const res = yield $apiClient.POST(
    "/session",
    {
      params: {
        header: {
          "project-key": "Frontend"
        }
      },
      body: __spreadProps(__spreadValues({}, data), {
        origin,
        referer,
        cookies,
        query: params,
        slug,
        analyticsId: getCookie("an_uuid"),
        analyticsIdv3: getCookie("an_uuid_v3"),
        extraData: __spreadProps(__spreadValues({}, data.extraData), {
          language,
          currency,
          email,
          quiz: quiz ? quiz : void 0
        })
      })
    }
  );
  if (!res.data) {
    throw new Error("Failed to create session.");
  }
  return res.data.data;
});

// src/browser/_utils/browser-fetch-utils.ts
var fetchJsonPostOptions = (data) => {
  return {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    }
  };
};

// src/browser/crm-auth/path.ts
var CRM_AUTH_SIGN_IN_PATH = "/api/crm-auth/sign-in";
var CRM_AUTH_SIGN_OUT_PATH = "/api/crm-auth/sign-out";
var CRM_AUTH_VERIFY_PATH = "/api/crm-auth/verify";

// src/browser/crm-auth/sign-in.ts
var signIn = (data) => __async(null, null, function* () {
  const res = yield fetch(
    CRM_AUTH_SIGN_IN_PATH,
    fetchJsonPostOptions(data)
  );
  return yield res.json();
});

// src/browser/crm-auth/sign-out.ts
var signOut = () => __async(null, null, function* () {
  const res = yield fetch(
    CRM_AUTH_SIGN_OUT_PATH,
    fetchJsonPostOptions({})
  );
  return yield res.json();
});

// src/browser/crm-auth/veirfy.ts
var verify = () => __async(null, null, function* () {
  const res = yield fetch(
    CRM_AUTH_VERIFY_PATH,
    fetchJsonPostOptions({})
  );
  return yield res.json();
});

// src/browser/ga/ga-track-event.ts
var gaTrackEvent = (eventName, options) => {
  try {
    window.dataLayer.push(__spreadValues({
      event: eventName
    }, options));
  } catch (e) {
  }
};

// src/browser/realtime/track-event.ts
var trackEvent = (type, uuid, options) => __async(null, null, function* () {
  try {
    const skipGa = !!(!!options && options.skipGa);
    if (!skipGa) {
      const gaOptions = !!options && !!options.ga ? options.ga : void 0;
      gaTrackEvent(type, gaOptions);
    }
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    const pathLength = !!options && !!options.path && !!options.path.length ? options.path.length : 3;
    const pathname = !!options && !!options.path && !!options.path.pathname ? options.path.pathname : window.location.pathname.split("/").slice(1, pathLength).join("/");
    const referer = !!options && !!options.path && !!options.path.referer ? options.path.referer : window.document.referrer;
    const origin = !!options && !!options.path && !!options.path.origin ? options.path.origin : window.location.origin;
    const eventData = {
      type,
      uuid,
      pathname,
      referer,
      origin,
      query: params,
      attr: options == null ? void 0 : options.attr,
      eventData: options == null ? void 0 : options.eventData
    };
    yield $apiClient.POST("/realtime/events/track-event", {
      body: eventData
    });
  } catch (e) {
  }
});

// src/browser/verify/email/verify-email.ts
var verifyEmail = (email) => __async(null, null, function* () {
  const res = yield $apiClient.GET(
    "/verify/email",
    {
      params: {
        query: {
          email
        },
        header: {
          "project-key": "FrontEnd"
        }
      }
    }
  );
  return res.data;
});

// src/browser/verify/phone/verify-phone.ts
var verifyPhone = (phone) => __async(null, null, function* () {
  const res = yield $apiClient.GET(
    "/verify/phone",
    {
      params: {
        query: {
          phone
        },
        header: {
          "project-key": "FrontEnd"
        }
      }
    }
  );
  return res.data;
});

// src/browser/session/get.ts
var getSession = (uuid) => __async(null, null, function* () {
  const res = yield $apiClient.GET(
    "/session/{uuid}",
    {
      params: {
        path: {
          uuid
        },
        header: {
          "project-key": "Frontend"
        }
      }
    }
  );
  if (!res.data) {
    throw new Error("Failed to append session.");
  }
  return res.data.data;
});

// src/browser/quiz/get.ts
var getQuiz = (uuid) => __async(null, null, function* () {
  const res = yield $apiClient.GET(
    "/quiz/{uuid}",
    {
      params: {
        path: {
          uuid
        },
        header: {
          "project-key": "Frontend"
        }
      }
    }
  );
  if (!res.data) {
    throw new Error("Failed to append session.");
  }
  return res.data.data;
});

// src/browser/capi/facebook-s2s.ts
var facebookS2S = (data) => __async(null, null, function* () {
  yield $apiClient.POST("/analytics/capi/facebook/event", {
    params: {
      header: {
        "project-key": "Frontend"
      }
    },
    body: data
  });
  return { success: true };
});

// src/browser/payments/create-session.ts
var createSession2 = (data) => __async(null, null, function* () {
  const res = yield $apiClient.POST("/payments/create-session", {
    params: {
      header: {
        "project-key": "Frontend"
      }
    },
    body: data
  });
  if (!res.data) {
    throw new Error("Failed to create payment session.");
  }
  return res.data;
});

// src/browser/payments/update-session.ts
var updateSession = (data) => __async(null, null, function* () {
  const res = yield $apiClient.POST("/payments/update-session", {
    params: {
      header: {
        "project-key": "Frontend"
      }
    },
    body: data
  });
  if (!res.data) {
    throw new Error("Failed to update payment session.");
  }
  return res.data;
});

// src/browser/payments/paypal/paypal-start-order.ts
var paypalStartOrder = (uuid, dto) => __async(null, null, function* () {
  const res = yield $apiClient.POST(
    "/dynamic-public/payments-paypal/v1/paypal/orders/from-session/{uuid}",
    {
      params: {
        header: {
          "project-key": "Frontend"
        },
        path: {
          uuid
        }
      },
      body: dto
    }
  );
  if (!res.data) {
    throw new Error("Failed to create payment session.");
  }
  return res.data;
});

// src/browser/payments/paypal/paypal-capture-order.ts
var paypalCaptureOrder = (uuid) => __async(null, null, function* () {
  const res = yield $apiClient.POST(
    "/dynamic-public/payments-paypal/v1/paypal/orders/{id}/capture",
    {
      params: {
        header: {
          "project-key": "Frontend"
        },
        path: {
          id: uuid
        }
      }
    }
  );
  if (!res.data) {
    throw new Error("Failed to create payment session.");
  }
  return res.data;
});

// src/browser/trustpilot/get-link.ts
var trustpilotGetLink = (data) => __async(null, null, function* () {
  const res = yield $apiClient.POST("/trustpilot/get-link", {
    params: {
      header: {
        "project-key": "Frontend"
      }
    },
    body: data
  });
  if (!res.data) {
    throw new Error("Failed to create payment session.");
  }
  return res.data;
});

// src/browser/trustpilot/send-invintation.ts
var trustpilotSendInvitation = (data) => __async(null, null, function* () {
  const res = yield $apiClient.POST("/trustpilot/send-invitation", {
    params: {
      header: {
        "project-key": "Frontend"
      }
    },
    body: data
  });
  if (!res.data) {
    throw new Error("Failed to create payment session.");
  }
  return res.data;
});

// src/browser/payments/yuno/yuno-create-payment.ts
var yunoCreatePayment = (dto) => __async(null, null, function* () {
  const res = yield $apiClient.POST(
    "/payments/yuno/create-payment",
    {
      params: {
        header: {
          "project-key": "Frontend"
        }
      },
      body: dto
    }
  );
  if (!res.data) {
    throw new Error("Failed to create payment session.");
  }
  return res.data;
});

// src/browser/payments/primer/primerRecurringChargeAndRefund.ts
var primerRecurringChargeAndRefund = (dto) => __async(null, null, function* () {
  const res = yield $apiClient.POST(
    "/payments/primer/payments/recurring-charge-refund",
    {
      params: {
        header: {
          "project-key": "Frontend"
        }
      },
      body: __spreadProps(__spreadValues({}, dto), {
        orderId: `${dto.orderId}-re-1`,
        amount: Math.floor(dto.amount * 100)
      })
    }
  );
  if (!res.data) {
    throw new Error("Failed to create payment session.");
  }
  return res.data;
});

// src/browser/payments/primer/primerRecurringChargeAndRefundDeferred.ts
var primerRecurringChargeAndRefundDeferred = (dto) => __async(null, null, function* () {
  const res = yield $apiClient.POST(
    "/payments/primer/payments/recurring-charge-refund-deferred",
    {
      params: {
        header: {
          "project-key": "Frontend"
        }
      },
      body: __spreadProps(__spreadValues({}, dto), {
        orderId: `${dto.orderId}-re-1`,
        amount: Math.floor(dto.amount * 100)
      })
    }
  );
  if (!res.data) {
    throw new Error("Failed to create payment session.");
  }
  return res.data;
});

// src/browser/session/create-with-currency.ts
var createSessionWithCurrency = (_a) => __async(null, null, function* () {
  var _b = _a, { language, email, currency, quiz } = _b, data = __objRest(_b, ["language", "email", "currency", "quiz"]);
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  const cookies = window.document.cookie;
  const referer = window.document.referrer;
  const origin = window.location.origin;
  const slug = window.location.pathname;
  const res = yield $apiClient.POST(
    "/session/with-currency",
    {
      params: {
        header: {
          "project-key": "Frontend"
        }
      },
      body: __spreadProps(__spreadValues({}, data), {
        origin,
        referer,
        cookies,
        query: params,
        slug,
        analyticsId: getCookie("an_uuid"),
        analyticsIdv3: getCookie("an_uuid_v3"),
        extraData: __spreadProps(__spreadValues({}, data.extraData), {
          language,
          currency,
          email,
          quiz: quiz ? quiz : void 0
        })
      })
    }
  );
  if (!res.data) {
    throw new Error("Failed to create session.");
  }
  return res.data;
});

// src/browser/session/get-with-currency.ts
var getSessionWithCurrency = (uuid) => __async(null, null, function* () {
  const res = yield $apiClient.GET(
    "/session/with-currency/{uuid}",
    {
      params: {
        path: {
          uuid
        },
        header: {
          "project-key": "Frontend"
        }
      }
    }
  );
  if (!res.data) {
    throw new Error("Failed to append session.");
  }
  return res.data;
});

// src/browser/currency/rate.ts
var getCurrencyRate = (dto) => __async(null, null, function* () {
  const res = yield $apiClient.POST(
    "/currency/rate",
    {
      body: dto,
      params: {
        header: {
          "project-key": "Frontend"
        }
      }
    }
  );
  if (!res.data) {
    throw new Error("Failed to append session.");
  }
  return res.data;
});

// src/browser/currency/currency-suggest.ts
var currencySuggest = (country) => __async(null, null, function* () {
  const res = yield $apiClient.GET(
    "/currency/suggest/{country}",
    {
      params: {
        path: {
          country
        },
        header: {
          "project-key": "Frontend"
        }
      }
    }
  );
  if (!res.data) {
    throw new Error("Failed to append session.");
  }
  return res.data;
});

// src/browser/capi/snapchat-s2s.ts
var snapchatS2s = (data) => __async(null, null, function* () {
  yield $apiClient.POST("/analytics/capi/snapchat/event", {
    params: {
      header: {
        "project-key": "Frontend"
      }
    },
    body: data
  });
  return { success: true };
});

// src/browser/capi/tiktok-s2s.ts
var tiktokS2S = (data) => __async(null, null, function* () {
  yield $apiClient.POST("/analytics/capi/tiktok/event", {
    params: {
      header: {
        "project-key": "Frontend"
      }
    },
    body: data
  });
  return { success: true };
});

// src/browser/jump-task/jump-task-create.ts
var jumpTaskCreate = (dto) => __async(null, null, function* () {
  const res = yield $apiClient.POST(
    "/dynamic-public/jump-task/session/create",
    {
      params: {
        header: {
          "project-key": "Frontend"
        }
      },
      body: dto
    }
  );
  if (!res.data) {
    throw new Error("Error creating session");
  }
  return res.data;
});

// src/browser/jump-task/jump-task-update.ts
var jumpTaskUpdate = (uuid, dto) => __async(null, null, function* () {
  const res = yield $apiClient.PATCH(
    "/dynamic-public/jump-task/session/{uuid}",
    {
      params: {
        header: {
          "project-key": "Frontend"
        },
        path: {
          uuid
        }
      },
      body: dto
    }
  );
  if (!res.data) {
    throw new Error("Error creating session");
  }
  return res.data;
});

// src/browser/session/mark-purchased.ts
var markPurchasedSession = (uuid) => __async(null, null, function* () {
  const res = yield $apiClient.GET(
    "/session/{uuid}/purchased",
    {
      params: {
        path: {
          uuid
        },
        header: {
          "project-key": "Frontend"
        }
      }
    }
  );
  if (!res.data) {
    throw new Error("Failed to append session.");
  }
  return { success: true };
});

// src/browser/cart/mark-paid.ts
var cartMarkPaid = (uuid, body) => __async(null, null, function* () {
  const res = yield $apiClient.POST(
    "/cart/{uuid}/paid",
    {
      params: {
        path: {
          uuid
        },
        header: {
          "project-key": "Frontend"
        }
      },
      body
    }
  );
  if (!res.data) {
    throw new Error("Failed to append session.");
  }
  return res.data;
});

// src/browser/payments/confirm-payment.ts
var confirmPayment = (_0, _1) => __async(null, [_0, _1], function* (uuid, {
  cart
}) {
  const cartData = yield cartMarkPaid(uuid, cart);
  yield markPurchasedSession(uuid);
  return cartData;
});

// src/browser/cart/append-cart.ts
var appendCart = (uuid, body) => __async(null, null, function* () {
  const res = yield $apiClient.PUT(
    "/cart/{uuid}",
    {
      params: {
        path: {
          uuid
        },
        header: {
          "project-key": "Frontend"
        }
      },
      body
    }
  );
  if (!res.data) {
    throw new Error("Failed to append session.");
  }
  return res.data.data;
});

// src/browser/cart/create-cart.ts
var createCart = (body) => __async(null, null, function* () {
  const res = yield $apiClient.POST(
    "/cart",
    {
      params: {
        header: {
          "project-key": "Frontend"
        }
      },
      body
    }
  );
  if (!res.data) {
    throw new Error("Failed to append session.");
  }
  return res.data.data;
});

// src/browser/cart/get-cart.ts
var getCart = (uuid) => __async(null, null, function* () {
  const res = yield $apiClient.GET(
    "/cart/{uuid}",
    {
      params: {
        path: {
          uuid
        },
        header: {
          "project-key": "Frontend"
        }
      }
    }
  );
  if (!res.data) {
    throw new Error("Failed to append session.");
  }
  return res.data;
});

// src/browser/klaviyo/klaviyo-send-event.ts
var klaviyoSendEvent = (dto) => __async(null, null, function* () {
  const res = yield $apiClient.POST(
    "/dynamic-public-direct/klaviyo/events",
    {
      params: {
        header: {
          "project-key": "Frontend"
        }
      },
      body: dto
    }
  );
  if (!res.data) {
    throw new Error("Failed to create payment session.");
  }
  return res.data;
});

// src/browser/klaviyo/klaviyo-send-bulk.ts
var klaviyoSendBulk = (dto) => __async(null, null, function* () {
  const res = yield $apiClient.POST(
    "/dynamic-public-direct/klaviyo/events/bulk",
    {
      params: {
        header: {
          "project-key": "Frontend"
        }
      },
      body: dto
    }
  );
  if (!res.data) {
    throw new Error("Failed to create payment session.");
  }
  return res.data;
});

// src/browser/realtime/realtime-utm-order-data.ts
var realtimeUtmOrderData = (uuid) => __async(null, null, function* () {
  const res = yield $apiClient.GET(
    "/realtime/events/utm-data/{uuid}",
    {
      params: {
        path: {
          uuid
        },
        header: {
          "project-key": "Frontend"
        }
      }
    }
  );
  if (!res.data) {
    throw new Error("Failed to get realtime utm data.");
  }
  return res.data;
});

// src/browser/order/order-get-by-uuid.ts
var orderGetByUuid = (uuid) => __async(null, null, function* () {
  const res = yield $apiClient.GET(
    "/dynamic-public/orders-management/report-item/order/{orderId}",
    {
      params: {
        header: {
          "project-key": "Frontend"
        },
        path: {
          orderId: uuid
        }
      }
    }
  );
  if (!res.data) {
    throw new Error("Failed to get order by uuid.");
  }
  return res.data;
});

// src/browser/order/order-get-by-email.ts
var orderGetByEmail = (email) => __async(null, null, function* () {
  const res = yield $apiClient.GET(
    "/dynamic-public/orders-management/report-item/email/{email}",
    {
      params: {
        header: {
          "project-key": "Frontend"
        },
        path: {
          email
        }
      }
    }
  );
  if (!res.data) {
    throw new Error("Failed to get order by email.");
  }
  return res.data;
});

// src/browser/payments/payment-first-payment.ts
var paymentFirstPayment = (uuid) => __async(null, null, function* () {
  const res = yield $apiClient.GET(
    "/dynamic-public/payments-management/payments/first-payment",
    {
      params: {
        header: {
          "project-key": "Frontend"
        },
        query: {
          referenceId: uuid
        }
      }
    }
  );
  if (!res.data) {
    throw new Error("Failed to get first payment.");
  }
  return res.data;
});

// src/browser/payments/payment-last-payments.ts
var paymentLastPayments = (uuid) => __async(null, null, function* () {
  const res = yield $apiClient.GET(
    "/dynamic-public/payments-management/payments/last-5-payments",
    {
      params: {
        header: {
          "project-key": "Frontend"
        },
        query: {
          referenceId: uuid
        }
      }
    }
  );
  if (!res.data) {
    throw new Error("Failed to get last payments.");
  }
  return res.data;
});

// src/browser/subscription/cancel-subscription-by-id.ts
var cancelSubscriptionById = (id, data) => __async(null, null, function* () {
  const res = yield $apiClient.POST("/dynamic-public/subscriptions-management/subscriptions/{id}/cancel", {
    params: {
      header: {
        "project-key": "Frontend"
      },
      path: {
        id
      }
    },
    body: data
  });
  if (!res.data) {
    throw new Error("Failed to cancel subscription.");
  }
  return res.data;
});

// src/browser/subscription/cancel-subscriptions-by-order-id.ts
var cancelSubscriptionsByOrderId = (uuid, data) => __async(null, null, function* () {
  const res = yield $apiClient.POST("/dynamic-public/subscriptions-management/subscriptions/order/{orderId}/cancel", {
    params: {
      header: {
        "project-key": "Frontend"
      },
      path: {
        orderId: uuid
      }
    },
    body: data
  });
  if (!res.data) {
    throw new Error("Failed to cancel subscription.");
  }
  return res.data;
});

// src/browser/subscription/subscription-apply-discount.ts
var subscriptionApplyDiscount = (data) => __async(null, null, function* () {
  const res = yield $apiClient.POST("/dynamic-public/subscriptions-management/subscriptions/discount", {
    params: {
      header: {
        "project-key": "Frontend"
      }
    },
    body: data
  });
  if (!res.data) {
    throw new Error("Failed to apply discount.");
  }
  return res.data;
});

// src/browser/subscription/subscription-pause.ts
var subscriptionPause = (data) => __async(null, null, function* () {
  const res = yield $apiClient.POST("/dynamic-public/subscriptions-management/subscriptions/pause", {
    params: {
      header: {
        "project-key": "Frontend"
      }
    },
    body: data
  });
  if (!res.data) {
    throw new Error("Failed to pause subscription.");
  }
  return res.data;
});

// src/browser/subscription/fill-subscription-cancel-request.ts
var fillSubscriptionCancelRequest = (data) => __async(null, null, function* () {
  const res = yield $apiClient.POST("/dynamic-public/subscriptions-management/subscription-cancel-requests", {
    params: {
      header: {
        "project-key": "Frontend"
      }
    },
    body: data
  });
  if (!res.data) {
    throw new Error("Failed to fill request.");
  }
  return res.data;
});

// src/browser/payments/paypal/paypal-start-rt.ts
var paypalStartRt = (uuid, dto) => __async(null, null, function* () {
  const res = yield $apiClient.POST(
    "/dynamic-public/payments-paypal/v1/paypal/billing-agreements/from-session/{uuid}",
    {
      params: {
        header: {
          "project-key": "Frontend"
        },
        path: {
          uuid
        }
      },
      body: dto
    }
  );
  if (!res.data) {
    throw new Error("Failed to start rt session.");
  }
  return res.data;
});

// src/browser/payments/paypal/paypal-capture-rt.ts
var paypalCaptureRt = (tokenBa, uuid) => __async(null, null, function* () {
  const res = yield $apiClient.POST(
    "/dynamic-public/payments-paypal/v1/paypal/billing-agreements/approve/{tokenBa}",
    {
      params: {
        header: {
          "project-key": "Frontend"
        },
        path: {
          tokenBa
        }
      }
    }
  );
  if (!res.data) {
    throw new Error("Failed to capture paypal order.");
  }
  const paymentRes = yield $apiClient.POST(
    "/dynamic-public/payments-paypal/v1/paypal/payments-v1/from-session/{uuid}",
    {
      params: {
        header: {
          "project-key": "Frontend"
        },
        path: {
          uuid
        }
      },
      body: {
        agreementId: res.data.id
      }
    }
  );
  if (!paymentRes || !paymentRes.data) {
    throw new Error("Failed to capture paypal order.");
  }
  return paymentRes.data;
});

// src/browser/cart/split-cart.ts
var splitCart = (uuid, body) => __async(null, null, function* () {
  const res = yield $apiClient.POST(
    "/dynamic-public/cart-v2/cart/{referenceId}/split",
    {
      params: {
        header: {
          "project-key": "Frontend"
        },
        path: {
          referenceId: uuid
        }
      },
      body
    }
  );
  if (!res.data) {
    throw new Error("Failed to append session.");
  }
  return res.data;
});

// src/browser/payments/primer/primer-upsell-charge.ts
var primerUpsellCharge = (dto) => __async(null, null, function* () {
  const res = yield $apiClient.POST("/dynamic-public/payments-primer/v1/primer-payment/reference", {
    params: {
      header: {
        "project-key": "Frontend"
      }
    },
    body: dto
  });
  if (!res || !res.data) {
    throw new Error("Failed to create payment session.");
  }
  return res.data;
});

// src/browser/payments/paypal/paypal-upsell-charge.ts
var paypalUpsellCharge = (dto) => __async(null, null, function* () {
  const res = yield $apiClient.POST("/dynamic-public/payments-paypal/payments/upsell-charge", {
    params: {
      header: {
        "project-key": "Frontend"
      }
    },
    body: dto
  });
  if (!res || !res.data) {
    throw new Error("Failed to create payment session.");
  }
  return res.data;
});

// src/browser/_utils/random-inclusive.ts
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// src/browser/payments/tax/tax-calculate-amount.ts
var taxCalculateAmount = (data) => __async(null, null, function* () {
  const res = yield $apiClient.POST("/dynamic-public/tax/tax/calculate", {
    params: {
      header: {
        "project-key": "Frontend"
      }
    },
    body: data
  });
  if (!res.data) {
    throw new Error("Failed to create payment session.");
  }
  return res.data;
});

// src/browser/payments/upsell-charge.ts
var upsellCharge = (_0) => __async(null, [_0], function* ({
  uuid,
  amount,
  type,
  description,
  metadata,
  orderId: passedOrderId
}) {
  const metaData = metadata || {};
  const skipTax = !!metaData.skipTax;
  const firstPayment = yield paymentFirstPayment(uuid);
  const session = yield getSession(uuid);
  let taxCalculation = {
    taxAmount: 0,
    amountWithTax: amount,
    taxPercent: 0
  };
  if (!skipTax) {
    taxCalculation = yield taxCalculateAmount({
      amount,
      countryCode: session.countryCode,
      state: session.state
    });
  }
  const orderId = passedOrderId ? passedOrderId : `${uuid}-up-${getRandomIntInclusive(1e3, 9999)}`;
  if (firstPayment.source === "primer") {
    return yield primerUpsellCharge({
      customerId: uuid,
      currencyCode: session.extraData.currency,
      amount: taxCalculation.amountWithTax,
      manualCapture: type === "authorize",
      metadata: __spreadProps(__spreadValues({}, metadata), {
        tx: taxCalculation.taxAmount,
        txp: taxCalculation.taxPercent
      }),
      orderId
    });
  } else if (firstPayment.source.includes("paypal")) {
    return yield paypalUpsellCharge({
      chargeId: firstPayment.chargeId,
      currency: session.extraData.currency,
      description: description ? description : "Charge",
      intent: type === "authorize" ? "AUTHORIZE" : "CAPTURE",
      orderId,
      metaData: __spreadProps(__spreadValues({}, metadata), {
        tx: taxCalculation.taxAmount,
        txp: taxCalculation.taxPercent
      }),
      total: taxCalculation.amountWithTax
    });
  }
  throw new Error("Unknown payment source");
});

// src/browser/payments/upsell-charge-from-cart.ts
var upsellChargeFromCart = (_0) => __async(null, [_0], function* ({
  cartUUID,
  type,
  description,
  metadata
}) {
  const uuid = cartUUID.substring(0, 36);
  const cart = yield getCart(cartUUID);
  const amount = cart.data.map((p) => p.quantity * p.product.price).reduce((a, b) => a + b, 0);
  return upsellCharge({ uuid, amount, type, description, metadata, orderId: cartUUID });
});

// src/browser/subscription/get-subscriptions-by-order-id.ts
var getSubscriptionsByOrderId = (uuid) => __async(null, null, function* () {
  const res = yield $apiClient.GET(
    "/dynamic-public/subscriptions-management/subscriptions/info-by-orderid",
    {
      params: {
        header: {
          "project-key": "Frontend"
        },
        query: {
          orderId: uuid
        }
      }
    }
  );
  if (!res.data) {
    throw new Error("Failed to get subscriptions by order id.");
  }
  return res.data;
});

// src/browser/payments/tax/get-tax-percent.ts
var getTaxPercent = (data) => __async(null, null, function* () {
  const res = yield $apiClient.POST("/dynamic-public/tax/tax/get", {
    params: {
      header: {
        "project-key": "Frontend"
      }
    },
    body: data
  });
  if (!res.data) {
    throw new Error("Failed to get tax percent.");
  }
  return res.data;
});

// src/index.ts
var browser = {
  capi: {
    facebook: facebookS2S,
    snapchat: snapchatS2s,
    tiktok: tiktokS2S
  },
  cart: {
    append: appendCart,
    create: createCart,
    get: getCart,
    markPaid: cartMarkPaid,
    cart: splitCart
  },
  mail: {
    sendToRecipient,
    sendToSupport
  },
  session: {
    append: appendSession,
    create: createSession,
    get: getSession,
    markPaid: markPurchasedSession
  },
  sessionWithCurrency: {
    get: getSessionWithCurrency,
    create: createSessionWithCurrency
  },
  currency: {
    rate: getCurrencyRate,
    suggest: currencySuggest,
    symbol: currencySuggest
  },
  crmAuth: {
    signIn,
    signOut,
    verify
  },
  realtime: {
    trackEvent,
    orderUtmData: realtimeUtmOrderData
  },
  verify: {
    email: verifyEmail,
    phone: verifyPhone
  },
  quiz: {
    get: getQuiz
  },
  payments: {
    createSession: createSession2,
    updateSession,
    upsell: {
      charge: upsellCharge,
      chargeFromCart: upsellChargeFromCart
    },
    confirmPayment,
    paypal: {
      startOrder: paypalStartOrder,
      captureOrder: paypalCaptureOrder
    },
    paypalRt: {
      start: paypalStartRt,
      capture: paypalCaptureRt
    },
    yuno: {
      createPayment: yunoCreatePayment
    },
    primer: {
      oneUsdChargeAndRefund: primerRecurringChargeAndRefund,
      oneUsdChargeAndRefundDeferred: primerRecurringChargeAndRefundDeferred
    },
    firstPayment: paymentFirstPayment,
    last5Payments: paymentLastPayments,
    tax: {
      getPercent: getTaxPercent,
      calculate: taxCalculateAmount
    }
  },
  trustpilot: {
    getLink: trustpilotGetLink,
    sendInvitation: trustpilotSendInvitation
  },
  jumpTask: {
    create: jumpTaskCreate,
    update: jumpTaskUpdate
  },
  klaviyo: {
    send: klaviyoSendEvent,
    sendBulk: klaviyoSendBulk
  },
  order: {
    getByUuid: orderGetByUuid,
    getByEmail: orderGetByEmail
  },
  subscription: {
    cancelById: cancelSubscriptionById,
    cancelByOrderId: cancelSubscriptionsByOrderId,
    applyDiscount: subscriptionApplyDiscount,
    pause: subscriptionPause,
    fillCancellationRequest: fillSubscriptionCancelRequest,
    get: getSubscriptionsByOrderId
  }
};
if (typeof window !== "undefined") {
  window.capibox = browser;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  browser
});
//# sourceMappingURL=index.js.map