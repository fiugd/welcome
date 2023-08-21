const state = {};
let subscribers = [];

const getRoute = () => {
  const pattern = new URLPattern({ hash: "/:route" });
  const result = pattern.exec({ hash: document.location.hash });
  return result?.hash?.groups?.route;
};
state.route = getRoute();

const get = (path) => {
  if (typeof path === "undefined") return state;
  return state[path];
};

const notify = (updates) => {
  for (const { path } of updates) {
    const toNotify = subscribers.filter((sub) =>
      (sub.paths || []).find((p) => path.startsWith(p))
    );
    for (const notify of toNotify) {
      notify.handler();
    }
    //todo: run all matching subscriber handlers
    //console.log({ subscribers, path, toNotify });
  }
};

const update = (updatesSrc) => {
  const updates = Array.isArray(updatesSrc) ? updatesSrc : [updatesSrc];
  for (const { path, value } of updates) {
    //TODO: instead, use lodash get/set here
    state[path] = value;
  }
  state.route = getRoute(); //TODO: bad...
  notify(updates);
};

const subscribe = (paths, handler) => {
  const id = (Math.random() + "").slice(2);
  subscribers.push({ id, paths, handler });
  const unsubscribe = () => {
    subscribers = subscribers.filter((x) => x.id !== id);
  };
  return unsubscribe;
};

export default { get, update, subscribe };
