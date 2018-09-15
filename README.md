# react-easy-context

(another) Easy context management for simple apps.
This library aims to provide a simple API to a multi-store state manager leveraging react new context API.
It's not meant to be used in complex applications and it should work on react-native without further configuration (haven't tested yet though).

### Setup
```javascript
import { createContext, buildStore } from 'react-easy-context';

// Define store actions
const userActions = {
  changeName: (state, setState) => {
    setState({ name: 'New name' });
  },
};

// Build store
const userStore = buildStore({
  name: 'User',
  consumername: 'User',
  initialValue: { name: 'Name' },
  actions: userActions,
  persist: true,
});

// Create context Provider and Store consumers
const { Provider, MainConsumer, UserConsumer } = createContext(
  userStore,
);

// Wrap your top-level component with Provider component
```
***createContext*** result is an object containing both the Provider and the respective Store Consumers, and a MainConsumer, a consumer with all the stores data and actions combined.

See [API Reference](#reference) below to a complete description of the possible configuration parameters you can pass to ***buildStore***.


### Consuming data from stores
#### Single store consumer
```javascript
class App extends Component {
  render() {
    return (
      <Provider>
        <UserConsumer>
          {({ state, actions: { changeName } }) => {
            return (
              <div>
                {state.name}
                <button onClick={changeName}>change name</button>
              </div>
            );
          }}
        </UserConsumer>
      </Provider>
    );
  }
}
```

#### Using MainConsumer
```javascript
class App extends Component {
  render() {
    return (
      <Provider>
        <MainConsumer>
          {({ state, actions: { User: { changeName } } }) => {
            return (
              <div>
                {state.User.name}
                <button onClick={changeName}>change name</button>
              </div>
            );
          }}
        </MainConsumer>
      </Provider>
    );
  }
}
```

### <a name="reference"></a>API Reference
#### buildStore configuration
| Property        | Description           | Values  |
| ----------- |:---------------------:| -------:|
| name      | Store name | String |
| consumerName      | Consumer name*      |   String | none |
| initialValue | Initial store value      |    Any |
| actions | Store actions**      |    Object |
| persist | Persist store on refresh      |    Boolean |


<nowiki>*</nowiki> If consumerName is not present in configuration the store consumer will have the follow nomenclature: StoreNameConsumer, eg UserConsumer.

** Read [Store Actions](#store_actions) section below to understand the capabilities of a store 
action.

#### <a name="store_actions"></a>Store actions
Store actions object is composed by functions, the keys are the action names that you're going to use to call the respective action.
 
An action is a function that receives the current store ***state*** and ***setState*** callback as parameters.

***setState*** has the same behaviour as React.Component setState, it will merge the first object to the new state and call the second argument when the merge is finished.

```javascript
const userActions = {
  setUser: (state, setState) => {
    setState({ name: 'New name' }, () => console.log("Name changed"));
  },
};
```

Actions that change more than one store should favour the use of MainConsumer created with ***createContext***, in this way you'll get access to each store actions and state.

### Todo
* Add tests
* Add example project
* Improve readme
  * Add more complex examples
  * Structure folder suggestion
* Add eslint-prettier
* Upgrade dependencies
* Middleware thinking (?)
