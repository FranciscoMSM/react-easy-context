import React, { Component } from 'react';
import { buildInitState } from './state';
import { pick, filter } from 'ramda';
import invariant from 'invariant';

const getPersistentStoreNames = (accKeys, store) =>
  store.persist ? [...accKeys, store.name] : accKeys;

export function createContext(...stores) {
  const AppContext = React.createContext();
  const keysToPersist = stores.reduce(getPersistentStoreNames, []);

  class Provider extends Component {
    constructor() {
      super();

      this.state = buildInitState(stores);

      this.actions = stores.reduce((accActions, store) => {
        const updateStore = this.updateState(store.name);

        const storeActions = combineStoreActions(
          store.actions,
          this.state,
          updateStore,
        );

        accActions[store.name] = storeActions;
        return accActions;
      }, {});
    }

    componentDidMount() {
      window.addEventListener('beforeunload', this.saveState);
    }

    componentWillUnmount() {
      window.removeEventListener('beforeunload', this.saveState);
    }

    saveState = () => {
      if (!keysToPersist.length) return;

      const state = pick(keysToPersist, this.state);

      window.localStorage.setItem('state', JSON.stringify(state));
    };

    updateState = name => (value, callback = () => null) => {
      this.setState({ [name]: value }, callback);
    };

    render() {
      return (
        <AppContext.Provider
          value={{ state: this.state, actions: this.actions }}
        >
          {this.props.children}
          <button onClick={this.saveState}>click</button>
        </AppContext.Provider>
      );
    }
  }

  return { Provider, ...createConsumers(AppContext.Consumer, stores) };
}

function combineStoreActions(actions, state, updateStore) {
  return Object.keys(actions).reduce((acc, name) => {
    acc[name] = () => actions[name](state, updateStore);
    return acc;
  }, {});
}

function createConsumers(MainConsumer, stores) {
  const consumers = stores.reduce(
    (accConsumers, { name: storeName, consumerName }) => {
      class Consumer extends Component {
        render() {
          return (
            <MainConsumer>
              {store =>
                this.props.children({
                  state: store.state[storeName],
                  actions: store.actions[storeName],
                })
              }
            </MainConsumer>
          );
        }
      }

      accConsumers[consumerName || storeName + 'Consumer'] = Consumer;
      return accConsumers;
    },
    {},
  );

  return { ...consumers, MainConsumer };
}

export function buildStore({
  name = 'NoNameStore',
  initialValue = {},
  actions = {},
  consumerName,
  persist = false,
}) {

  // invariant(name == null, 'Cannot create store. Invalid name.')

  return {
    name,
    initialValue,
    actions,
    consumerName,
    persist,
  };
}
