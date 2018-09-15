export function buildInitState(stores) {
  const oldState = window.localStorage.getItem('state');

  const initialState = stores.reduce((accState, store) => {
    accState[store.name] = store.initialValue || {};
    return accState;
  }, {});

  return oldState != null
    ? { ...initialState, ...JSON.parse(oldState) }
    : initialState;
}
