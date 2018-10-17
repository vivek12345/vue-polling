# 🔔 vue-polling


Easy to use polling service built with vue.

### 🚚 Installation

```
yarn add vue-polling
```

or

```
npm i vue-polling --save
```

### ⚡️ Usage

```html
<template>
    <VuePolling 
    url="url to poll"
    :interval="3000"
    :retryCount="3" // this is optional
    :onSuccess="handleSuccess" 
    :onFailure="handleFailure" // this is optional
    :method="GET"
    :headers="headers object" // this is optional
    :body="JSON.stringify(data)" // data to send in a post call. Should be stringified always
  >
    <div slot-scope="{ isPolling, startPolling, stopPolling }">
      <p v-if="isPolling">Hi I am polling</p>
      <p v-else>Hi I am not polling</p>
    </div>
  </VuePolling>
</template>
```

```js
<script>
import VuePolling from "VuePolling";

export default {
  name: "App",
  components: {
    VuePolling
  },
  methods: {
    handleSuccess(response) {
      const { data } = response;
      if (data) {
        const { status } = data;
        if (status === "awaiting_product_selection") {
          return true;
        } else {
          return false;
        }
      }
    },
    handleFailure() {
      return true;
    }
  }
};
</script>

```

## 📒 Api

### 🔔 react-polling

| Props                   | Type                   | Default   | Description                                                                                         |
|-------------------------|------------------------|-----------|-----------------------------------------------------------------------------------------------------|
| url                     | string                 | null      | url/api to poll                                                                                     |
| interval                | number                 | 3000      | Interval of polling                                                                                 |
| retryCount              | number                 | 0         | Number of times to retry when an api polling call fails                                             |
| onSuccess               | function               | -         | Callback function on successful polling. This should return true to continue polling                |
| onFailure               | function               | () => {}  | Callback function on failed polling or api failure                                                  |
| method                  | string                 | GET       | HTTP Method of the api to call                                                                      |
| headers                 | object                 | -         | Any specific http headers that need to be sent with the request                                     |
| body                    | object                 | -         | The data that need to be sent in a post/put call                                                    |

#### onSuccess (required)

This function will be called every time the polling service gets a successful response.
You should return true to continue polling and false to stop polling. It has the following signature:

```javascript
function onSuccess(response) {
  // You can do anything with this response, may be add to an array of some state of your react component
  // return true to continue polling
  // return false to stop polling
}
```

#### onFailure (not compulsory field)

This function will be called every time the polling service gets a failure response from the api, it can be 401 or 500 or any failure status code.
You can do some cleaning up of your variables or reseting the state here.

```javascript
function onFailure(error) {
  // You can log this error to some logging service
  // clean up some state and variables.
}
```

## 👍 Contribute

Show your ❤️ and support by giving a ⭐. Any suggestions and pull request are welcome !

### 📝 License

MIT © [viveknayyar](https://github.com/vivek12345)

## 👷 TODO

- [x] Complete README
- [ ] Add Examples and Demo
- [x] Test Suite
