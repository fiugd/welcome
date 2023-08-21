const components = [
  {
    name: "Data",
  },
  {
    name: "ForEach",
  },
  {
    name: "Container",
  },
];

const getComponent = async (node) => {
  const component = components.find(
    (x) => x.name.toLowerCase() === node.tagName.toLowerCase()
  );
  if (typeof component?.name === "undefined") return;
  if (typeof component.module === "undefined") {
    component.module = (
      (await import(
        "../components/" + (component.path || component.name) + ".js"
      )) || {}
    ).default;
  }
  return component;
};

const getFragment = async (path) => {
  return await fetch("./fragments/" + path)
    .then((x) => x.text())
    .then((str) => {
      //return new window.DOMParser().parseFromString(str, "text/xml");
      const div = document.createElement("div");
      div.innerHTML = str;
      return div;
    });
};

const update = async ({ path, swap, debug }) => {
  const swapEl = {
    string: () => document.querySelector(swap),
    object: () => (swap instanceof Element ? swap : undefined),
  }[typeof swap]();

  const el = await getFragment(path);
  const descendants = Array.from(el.querySelectorAll("*"));

  for (const node of descendants) {
    const component = await getComponent(node);
    if (typeof component?.module === "function") {
      await component.module(node);
      continue;
    }
    if (["svg", "rect", "path"].includes(node.tagName)) continue;
    // this should probably/maybe be handled when components are defined
    for (const attrName of node.getAttributeNames()) {
      if (["id", "class", "href", "placeholder"].includes(attrName)) continue;
      node.style[attrName] = node.getAttribute(attrName);
      node.removeAttribute(attrName);
    }
  }
  if (debug) debugger;
  swapEl.innerHTML = el.innerHTML;
};

export default { update };
