import State from "../modules/state.js";

const setData = async ({ name, src }) => {
  const path = src.startsWith("/") ? `..${src}` : `../${src}`;
  const value = (await import(path)).default;
  State.update({ path: name, value });
};

const Data = (node) => {
  const name = node.getAttribute("name");
  const src = node.getAttribute("src");
  //node.remove();
  const comment = document.createComment(
    ` Data: ${JSON.stringify({ name, src })} `
  );
  node.replaceWith(comment);
  setData({ name, src });
};

export default Data;
