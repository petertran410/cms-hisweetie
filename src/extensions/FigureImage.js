import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { uploadFileCdn } from '@/utils/helper';

export const FigureImage = Node.create({
  name: 'figureImage',
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null
      },
      alt: {
        default: null
      },
      caption: {
        default: null
      },
      width: {
        default: null
      },
      height: {
        default: null
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[class="image-with-caption"]',
        getAttrs: (dom) => {
          const img = dom.querySelector('img');
          const figcaption = dom.querySelector('figcaption');

          return {
            src: img?.getAttribute('src') || null,
            alt: img?.getAttribute('alt') || null,
            caption: figcaption?.textContent || null,
            width: img?.getAttribute('width') || null,
            height: img?.getAttribute('height') || null
          };
        }
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'figure',
      { class: 'image-with-caption' },
      ['img', mergeAttributes({ src: HTMLAttributes.src, alt: HTMLAttributes.alt || '' })],
      ['figcaption', HTMLAttributes.caption ? HTMLAttributes.caption : '']
    ];
  },

  addCommands() {
    return {
      insertFigureImage:
        (attributes) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: attributes
            })
            .run();
        },
      updateFigureImage:
        (attributes) =>
        ({ tr, dispatch }) => {
          const { selection } = tr;
          const node = tr.doc.nodeAt(selection.from);

          if (node && node.type.name === this.name) {
            tr.setNodeMarkup(selection.from, undefined, {
              ...node.attrs,
              ...attributes
            });

            if (dispatch) {
              dispatch(tr);
            }

            return true;
          }

          return false;
        }
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('figureImageHandler'),
        props: {
          handleDOMEvents: {
            click: (view, event) => {
              const { state } = view;
              const { selection } = state;
              const { empty, from } = selection;

              if (!empty) {
                return false;
              }

              const node = state.doc.nodeAt(from);

              if (node && node.type.name === this.name) {
                const target = event.target;

                if (target.nodeName === 'IMG' || target.nodeName === 'FIGCAPTION') {
                  const nodePos = from;

                  // Dispatch custom event for the editor to handle
                  window.dispatchEvent(
                    new CustomEvent('editFigureImage', {
                      detail: {
                        node,
                        pos: nodePos
                      }
                    })
                  );

                  return true;
                }
              }

              return false;
            }
          }
        }
      })
    ];
  }
});

export default FigureImage;
