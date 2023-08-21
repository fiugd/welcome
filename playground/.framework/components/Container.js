import Fragments from "../modules/fragments.js";

const render = async (args) => {
  let { template, target } = args;
  const path = template.getAttribute("path");
  if ((target?.id || "").startsWith("container-")) {
    target = document.getElementById(target.id);
  }
  const div = document.createElement("div");
  div.className = [
    "container",
    "fit-parent",
    ...template.className.split(" "),
  ].join(" ");
  div.id = "container-" + Math.random().toString().replace("0.", "");

  if (typeof path !== "undefined" && path) {
    await Fragments.update({
      path: path + ".xml",
      swap: div,
      debug: false,
    });
  }
  target.replaceWith(div);
  return div;
};

const Container = async (node) => {
  const template = node;
  let target = node;
  target = await render({ template, target });
};

export default Container;
