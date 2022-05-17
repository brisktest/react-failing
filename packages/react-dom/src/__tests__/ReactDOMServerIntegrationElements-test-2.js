/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

const ReactDOMServerIntegrationUtils = require('./utils/ReactDOMServerIntegrationTestUtils');

const TEXT_NODE_TYPE = 3;

let React;
let ReactDOM;
let ReactDOMServer;
let ReactTestUtils;

function initModules() {
  jest.resetModuleRegistry();
  React = require('react');
  ReactDOM = require('react-dom');
  ReactDOMServer = require('react-dom/server');
  ReactTestUtils = require('react-dom/test-utils');

  // Make them available to the helpers.
  return {
    ReactDOM,
    ReactDOMServer,
    ReactTestUtils,
  };
}

const {
  resetModules,
  itRenders,

  itThrowsWhenRendering,
  serverRender,
  streamRender,
  clientRenderOnServerString,
  clientCleanRender,
} = ReactDOMServerIntegrationUtils(initModules);

describe('ReactDOMServerIntegration', () => {
  beforeEach(() => {
    resetModules();
  });

  describe('elements and children', function() {
    // specially wrapped components
    // (see the big switch near the beginning ofReactDOMComponent.mountComponent)

    function expectNode(node, type, value) {
      expect(node).not.toBe(null);
      expect(node.nodeType).toBe(type);
      expect(node.nodeValue).toMatch(value);
    }

    function expectTextNode(node, text) {
      expectNode(node, TEXT_NODE_TYPE, text);
    }

    describe('null, false, and undefined children', function() {
      itRenders('null single child as blank', async render => {
        const e = await render(<div>{null}</div>);
        expect(e.childNodes.length).toBe(0);
      });

      itRenders('false single child as blank', async render => {
        const e = await render(<div>{false}</div>);
        expect(e.childNodes.length).toBe(0);
      });

      itRenders('undefined single child as blank', async render => {
        const e = await render(<div>{undefined}</div>);
        expect(e.childNodes.length).toBe(0);
      });

      itRenders('a null component children as empty', async render => {
        const NullComponent = () => null;
        const e = await render(
          <div>
            <NullComponent />
          </div>,
        );
        expect(e.childNodes.length).toBe(0);
      });

      itRenders('null children as blank', async render => {
        const e = await render(<div>{null}foo</div>);
        expect(e.childNodes.length).toBe(render === streamRender ? 2 : 1);
        expectTextNode(e.childNodes[0], 'foo');
      });

      itRenders('false children as blank', async render => {
        const e = await render(<div>{false}foo</div>);
        expect(e.childNodes.length).toBe(render === streamRender ? 2 : 1);
        expectTextNode(e.childNodes[0], 'foo');
      });

      itRenders('null and false children together as blank', async render => {
        const e = await render(
          <div>
            {false}
            {null}foo{null}
            {false}
          </div>,
        );
        expect(e.childNodes.length).toBe(render === streamRender ? 2 : 1);
        expectTextNode(e.childNodes[0], 'foo');
      });

      itRenders('only null and false children as blank', async render => {
        const e = await render(
          <div>
            {false}
            {null}
            {null}
            {false}
          </div>,
        );
        expect(e.childNodes.length).toBe(0);
      });
    });

    describe('elements with implicit namespaces', function() {
      itRenders('an svg element', async render => {
        const e = await render(<svg />);
        expect(e.childNodes.length).toBe(0);
        expect(e.tagName).toBe('svg');
        expect(e.namespaceURI).toBe('http://www.w3.org/2000/svg');
      });

      itRenders('svg child element with an attribute', async render => {
        const e = await render(<svg viewBox="0 0 0 0" />);
        expect(e.childNodes.length).toBe(0);
        expect(e.tagName).toBe('svg');
        expect(e.namespaceURI).toBe('http://www.w3.org/2000/svg');
        expect(e.getAttribute('viewBox')).toBe('0 0 0 0');
      });

      itRenders(
        'svg child element with a namespace attribute',
        async render => {
          let e = await render(
            <svg>
              <image xlinkHref="http://i.imgur.com/w7GCRPb.png" />
            </svg>,
          );
          e = e.firstChild;
          expect(e.childNodes.length).toBe(0);
          expect(e.tagName).toBe('image');
          expect(e.namespaceURI).toBe('http://www.w3.org/2000/svg');
          expect(e.getAttributeNS('http://www.w3.org/1999/xlink', 'href')).toBe(
            'http://i.imgur.com/w7GCRPb.png',
          );
        },
      );

      itRenders('svg child element with a badly cased alias', async render => {
        let e = await render(
          <svg>
            <image xlinkhref="http://i.imgur.com/w7GCRPb.png" />
          </svg>,
          1,
        );
        e = e.firstChild;
        expect(e.hasAttributeNS('http://www.w3.org/1999/xlink', 'href')).toBe(
          false,
        );
        expect(e.getAttribute('xlinkhref')).toBe(
          'http://i.imgur.com/w7GCRPb.png',
        );
      });

      itRenders('svg element with a tabIndex attribute', async render => {
        const e = await render(<svg tabIndex="1" />);
        expect(e.tabIndex).toBe(1);
      });

      itRenders(
        'svg element with a badly cased tabIndex attribute',
        async render => {
          const e = await render(<svg tabindex="1" />, 1);
          expect(e.tabIndex).toBe(1);
        },
      );

      itRenders('svg element with a mixed case name', async render => {
        let e = await render(
          <svg>
            <filter>
              <feMorphology />
            </filter>
          </svg>,
        );
        e = e.firstChild.firstChild;
        expect(e.childNodes.length).toBe(0);
        expect(e.tagName).toBe('feMorphology');
        expect(e.namespaceURI).toBe('http://www.w3.org/2000/svg');
      });

      itRenders('a math element', async render => {
        const e = await render(<math />);
        expect(e.childNodes.length).toBe(0);
        expect(e.tagName).toBe('math');
        expect(e.namespaceURI).toBe('http://www.w3.org/1998/Math/MathML');
      });
    });

    describe('newline-eating elements', function() {
      itRenders(
        'a newline-eating tag with content not starting with \\n',
        async render => {
          const e = await render(<pre>Hello</pre>);
          expect(e.textContent).toBe('Hello');
        },
      );
      itRenders(
        'a newline-eating tag with content starting with \\n',
        async render => {
          const e = await render(<pre>{'\nHello'}</pre>);
          expect(e.textContent).toBe('\nHello');
        },
      );
      itRenders('a normal tag with content starting with \\n', async render => {
        const e = await render(<div>{'\nHello'}</div>);
        expect(e.textContent).toBe('\nHello');
      });
    });

    describe('different component implementations', function() {
      function checkFooDiv(e) {
        expect(e.childNodes.length).toBe(1);
        expectNode(e.firstChild, TEXT_NODE_TYPE, 'foo');
      }

      itRenders('stateless components', async render => {
        const FunctionComponent = () => <div>foo</div>;
        checkFooDiv(await render(<FunctionComponent />));
      });

      itRenders('ES6 class components', async render => {
        class ClassComponent extends React.Component {
          render() {
            return <div>foo</div>;
          }
        }
        checkFooDiv(await render(<ClassComponent />));
      });

      if (require('shared/ReactFeatureFlags').disableModulePatternComponents) {
        itThrowsWhenRendering(
          'factory components',
          async render => {
            const FactoryComponent = () => {
              return {
                render: function() {
                  return <div>foo</div>;
                },
              };
            };
            await render(<FactoryComponent />, 1);
          },
          'Objects are not valid as a React child (found: object with keys {render})',
        );
      } else {
        itRenders('factory components', async render => {
          const FactoryComponent = () => {
            return {
              render: function() {
                return <div>foo</div>;
              },
            };
          };
          checkFooDiv(await render(<FactoryComponent />, 1));
        });
      }
    });

    describe('component hierarchies', function() {
      itRenders('single child hierarchies of components', async render => {
        const Component = props => <div>{props.children}</div>;
        let e = await render(
          <Component>
            <Component>
              <Component>
                <Component />
              </Component>
            </Component>
          </Component>,
        );
        for (let i = 0; i < 3; i++) {
          expect(e.tagName).toBe('DIV');
          expect(e.childNodes.length).toBe(1);
          e = e.firstChild;
        }
        expect(e.tagName).toBe('DIV');
        expect(e.childNodes.length).toBe(0);
      });

      itRenders('multi-child hierarchies of components', async render => {
        const Component = props => <div>{props.children}</div>;
        const e = await render(
          <Component>
            <Component>
              <Component />
              <Component />
            </Component>
            <Component>
              <Component />
              <Component />
            </Component>
          </Component>,
        );
        expect(e.tagName).toBe('DIV');
        expect(e.childNodes.length).toBe(2);
        for (let i = 0; i < 2; i++) {
          const child = e.childNodes[i];
          expect(child.tagName).toBe('DIV');
          expect(child.childNodes.length).toBe(2);
          for (let j = 0; j < 2; j++) {
            const grandchild = child.childNodes[j];
            expect(grandchild.tagName).toBe('DIV');
            expect(grandchild.childNodes.length).toBe(0);
          }
        }
      });

      itRenders('a div with a child', async render => {
        const e = await render(
          <div id="parent">
            <div id="child" />
          </div>,
        );
        expect(e.id).toBe('parent');
        expect(e.childNodes.length).toBe(1);
        expect(e.childNodes[0].id).toBe('child');
        expect(e.childNodes[0].childNodes.length).toBe(0);
      });

      itRenders('a div with multiple children', async render => {
        const e = await render(
          <div id="parent">
            <div id="child1" />
            <div id="child2" />
          </div>,
        );
        expect(e.id).toBe('parent');
        expect(e.childNodes.length).toBe(2);
        expect(e.childNodes[0].id).toBe('child1');
        expect(e.childNodes[0].childNodes.length).toBe(0);
        expect(e.childNodes[1].id).toBe('child2');
        expect(e.childNodes[1].childNodes.length).toBe(0);
      });

      itRenders(
        'a div with multiple children separated by whitespace',
        async render => {
          const e = await render(
            <div id="parent">
              <div id="child1" /> <div id="child2" />
            </div>,
          );
          expect(e.id).toBe('parent');
          expect(e.childNodes.length).toBe(render === streamRender ? 4 : 3);
          const child1 = e.childNodes[0];
          const textNode = e.childNodes[1];
          const child2 = e.childNodes[render === streamRender ? 3 : 2];
          expect(child1.id).toBe('child1');
          expect(child1.childNodes.length).toBe(0);
          expectTextNode(textNode, ' ');
          expect(child2.id).toBe('child2');
          expect(child2.childNodes.length).toBe(0);
        },
      );

      itRenders(
        'a div with a single child surrounded by whitespace',
        async render => {
          // prettier-ignore
          const e = await render(<div id="parent">  <div id="child" />   </div>); // eslint-disable-line no-multi-spaces
          expect(e.childNodes.length).toBe(render === streamRender ? 5 : 3);
          const textNode1 = e.childNodes[0];
          const child = e.childNodes[render === streamRender ? 2 : 1];
          const textNode2 = e.childNodes[render === streamRender ? 3 : 2];
          expect(e.id).toBe('parent');
          expectTextNode(textNode1, '  ');
          expect(child.id).toBe('child');
          expect(child.childNodes.length).toBe(0);
          expectTextNode(textNode2, '   ');
        },
      );

      itRenders('a composite with multiple children', async render => {
        const Component = props => props.children;
        const e = await render(
          <Component>{['a', 'b', [undefined], [[false, 'c']]]}</Component>,
        );

        const parent = e.parentNode;
        if (
          render === serverRender ||
          render === clientRenderOnServerString ||
          render === streamRender
        ) {
          // For plain server markup result we have comments between.
          // If we're able to hydrate, they remain.
          expect(parent.childNodes.length).toBe(
            render === streamRender ? 6 : 5,
          );
          expectTextNode(parent.childNodes[0], 'a');
          expectTextNode(parent.childNodes[2], 'b');
          expectTextNode(parent.childNodes[4], 'c');
        } else {
          expect(parent.childNodes.length).toBe(3);
          expectTextNode(parent.childNodes[0], 'a');
          expectTextNode(parent.childNodes[1], 'b');
          expectTextNode(parent.childNodes[2], 'c');
        }
      });
    });
    itRenders('an img', async render => {
      const e = await render(<img />);
      expect(e.childNodes.length).toBe(0);
      expect(e.nextSibling).toBe(null);
      expect(e.tagName).toBe('IMG');
    });

    itRenders('a button', async render => {
      const e = await render(<button />);
      expect(e.childNodes.length).toBe(0);
      expect(e.nextSibling).toBe(null);
      expect(e.tagName).toBe('BUTTON');
    });

    itRenders('a div with dangerouslySetInnerHTML number', async render => {
      // Put dangerouslySetInnerHTML one level deeper because otherwise
      // hydrating from a bad markup would cause a mismatch (since we don't
      // patch dangerouslySetInnerHTML as text content).
      const e = (
        await render(
          <div>
            <span dangerouslySetInnerHTML={{__html: 0}} />
          </div>,
        )
      ).firstChild;
      expect(e.childNodes.length).toBe(1);
      expect(e.firstChild.nodeType).toBe(TEXT_NODE_TYPE);
      expect(e.textContent).toBe('0');
    });

    itRenders('a div with dangerouslySetInnerHTML boolean', async render => {
      // Put dangerouslySetInnerHTML one level deeper because otherwise
      // hydrating from a bad markup would cause a mismatch (since we don't
      // patch dangerouslySetInnerHTML as text content).
      const e = (
        await render(
          <div>
            <span dangerouslySetInnerHTML={{__html: false}} />
          </div>,
        )
      ).firstChild;
      expect(e.childNodes.length).toBe(1);
      expect(e.firstChild.nodeType).toBe(TEXT_NODE_TYPE);
      expect(e.firstChild.data).toBe('false');
    });

    itRenders(
      'a div with dangerouslySetInnerHTML text string',
      async render => {
        // Put dangerouslySetInnerHTML one level deeper because otherwise
        // hydrating from a bad markup would cause a mismatch (since we don't
        // patch dangerouslySetInnerHTML as text content).
        const e = (
          await render(
            <div>
              <span dangerouslySetInnerHTML={{__html: 'hello'}} />
            </div>,
          )
        ).firstChild;
        expect(e.childNodes.length).toBe(1);
        expect(e.firstChild.nodeType).toBe(TEXT_NODE_TYPE);
        expect(e.textContent).toBe('hello');
      },
    );

    itRenders(
      'a div with dangerouslySetInnerHTML element string',
      async render => {
        const e = await render(
          <div dangerouslySetInnerHTML={{__html: "<span id='child'/>"}} />,
        );
        expect(e.childNodes.length).toBe(1);
        expect(e.firstChild.tagName).toBe('SPAN');
        expect(e.firstChild.getAttribute('id')).toBe('child');
        expect(e.firstChild.childNodes.length).toBe(0);
      },
    );

    itRenders('a div with dangerouslySetInnerHTML object', async render => {
      const obj = {
        toString() {
          return "<span id='child'/>";
        },
      };
      const e = await render(<div dangerouslySetInnerHTML={{__html: obj}} />);
      expect(e.childNodes.length).toBe(1);
      expect(e.firstChild.tagName).toBe('SPAN');
      expect(e.firstChild.getAttribute('id')).toBe('child');
      expect(e.firstChild.childNodes.length).toBe(0);
    });

    itRenders(
      'a div with dangerouslySetInnerHTML set to null',
      async render => {
        const e = await render(
          <div dangerouslySetInnerHTML={{__html: null}} />,
        );
        expect(e.childNodes.length).toBe(0);
      },
    );

    itRenders(
      'a div with dangerouslySetInnerHTML set to undefined',
      async render => {
        const e = await render(
          <div dangerouslySetInnerHTML={{__html: undefined}} />,
        );
        expect(e.childNodes.length).toBe(0);
      },
    );

    itRenders('a noscript with children', async render => {
      const e = await render(
        <noscript>
          <div>Enable JavaScript to run this app.</div>
        </noscript>,
      );
      if (render === clientCleanRender) {
        // On the client we ignore the contents of a noscript
        expect(e.childNodes.length).toBe(0);
      } else {
        // On the server or when hydrating the content should be correct
        expect(e.childNodes.length).toBe(1);
        expect(e.firstChild.textContent).toBe(
          '<div>Enable JavaScript to run this app.</div>',
        );
      }
    });
  });
});
