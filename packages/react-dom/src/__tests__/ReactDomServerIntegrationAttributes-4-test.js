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

let React;
let ReactDOM;
let ReactTestUtils;
let ReactDOMServer;

function initModules() {
  // Reset warning cache.
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

const {resetModules, itRenders} = ReactDOMServerIntegrationUtils(initModules);

describe('ReactDOMServerIntegration', () => {
  beforeEach(() => {
    resetModules();
  });

  describe('download property (combined boolean/string attribute)', function() {
    itRenders('download prop with true value', async render => {
      const e = await render(<a download={true} />);
      expect(e.getAttribute('download')).toBe('');
    });

    itRenders('download prop with false value', async render => {
      const e = await render(<a download={false} />);
      expect(e.getAttribute('download')).toBe(null);
    });

    itRenders('download prop with string value', async render => {
      const e = await render(<a download="myfile" />);
      expect(e.getAttribute('download')).toBe('myfile');
    });

    itRenders('download prop with string "false" value', async render => {
      const e = await render(<a download="false" />);
      expect(e.getAttribute('download')).toBe('false');
    });

    itRenders('download prop with string "true" value', async render => {
      const e = await render(<a download={'true'} />);
      expect(e.getAttribute('download')).toBe('true');
    });

    itRenders('download prop with number 0 value', async render => {
      const e = await render(<a download={0} />);
      expect(e.getAttribute('download')).toBe('0');
    });

    itRenders('no download prop with null value', async render => {
      const e = await render(<div download={null} />);
      expect(e.hasAttribute('download')).toBe(false);
    });

    itRenders('no download prop with undefined value', async render => {
      const e = await render(<div download={undefined} />);
      expect(e.hasAttribute('download')).toBe(false);
    });

    itRenders('no download prop with function value', async render => {
      const e = await render(<div download={function() {}} />, 1);
      expect(e.hasAttribute('download')).toBe(false);
    });

    itRenders('no download prop with symbol value', async render => {
      const e = await render(<div download={Symbol('foo')} />, 1);
      expect(e.hasAttribute('download')).toBe(false);
    });
  });

  describe('className property', function() {
    itRenders('className prop with string value', async render => {
      const e = await render(<div className="myClassName" />);
      expect(e.getAttribute('class')).toBe('myClassName');
    });

    itRenders('className prop with empty string value', async render => {
      const e = await render(<div className="" />);
      expect(e.getAttribute('class')).toBe('');
    });

    itRenders('no className prop with true value', async render => {
      const e = await render(<div className={true} />, 1);
      expect(e.hasAttribute('class')).toBe(false);
    });

    itRenders('no className prop with false value', async render => {
      const e = await render(<div className={false} />, 1);
      expect(e.hasAttribute('class')).toBe(false);
    });

    itRenders('no className prop with null value', async render => {
      const e = await render(<div className={null} />);
      expect(e.hasAttribute('className')).toBe(false);
    });

    itRenders('badly cased className with a warning', async render => {
      const e = await render(<div classname="test" />, 1);
      expect(e.hasAttribute('class')).toBe(false);
      expect(e.hasAttribute('classname')).toBe(true);
    });

    itRenders(
      'className prop when given the alias with a warning',
      async render => {
        const e = await render(<div class="test" />, 1);
        expect(e.className).toBe('test');
      },
    );

    itRenders('className prop when given a badly cased alias', async render => {
      const e = await render(<div cLASs="test" />, 1);
      expect(e.className).toBe('test');
    });
  });

  describe('htmlFor property', function() {
    itRenders('htmlFor with string value', async render => {
      const e = await render(<div htmlFor="myFor" />);
      expect(e.getAttribute('for')).toBe('myFor');
    });

    itRenders('no badly cased htmlfor', async render => {
      const e = await render(<div htmlfor="myFor" />, 1);
      expect(e.hasAttribute('for')).toBe(false);
      expect(e.getAttribute('htmlfor')).toBe('myFor');
    });

    itRenders('htmlFor with an empty string', async render => {
      const e = await render(<div htmlFor="" />);
      expect(e.getAttribute('for')).toBe('');
    });

    itRenders('no htmlFor prop with true value', async render => {
      const e = await render(<div htmlFor={true} />, 1);
      expect(e.hasAttribute('for')).toBe(false);
    });

    itRenders('no htmlFor prop with false value', async render => {
      const e = await render(<div htmlFor={false} />, 1);
      expect(e.hasAttribute('for')).toBe(false);
    });

    itRenders('no htmlFor prop with null value', async render => {
      const e = await render(<div htmlFor={null} />);
      expect(e.hasAttribute('htmlFor')).toBe(false);
    });
  });

  describe('numeric properties', function() {
    itRenders('positive numeric property with positive value', async render => {
      const e = await render(<input size={2} />);
      expect(e.getAttribute('size')).toBe('2');
    });

    itRenders('numeric property with zero value', async render => {
      const e = await render(<ol start={0} />);
      expect(e.getAttribute('start')).toBe('0');
    });

    itRenders('no positive numeric property with zero value', async render => {
      const e = await render(<input size={0} />);
      expect(e.hasAttribute('size')).toBe(false);
    });

    itRenders('no numeric prop with function value', async render => {
      const e = await render(<ol start={function() {}} />, 1);
      expect(e.hasAttribute('start')).toBe(false);
    });

    itRenders('no numeric prop with symbol value', async render => {
      const e = await render(<ol start={Symbol('foo')} />, 1);
      expect(e.hasAttribute('start')).toBe(false);
    });

    itRenders('no positive numeric prop with function value', async render => {
      const e = await render(<input size={function() {}} />, 1);
      expect(e.hasAttribute('size')).toBe(false);
    });

    itRenders('no positive numeric prop with symbol value', async render => {
      const e = await render(<input size={Symbol('foo')} />, 1);
      expect(e.hasAttribute('size')).toBe(false);
    });
  });

  describe('props with special meaning in React', function() {
    itRenders('no ref attribute', async render => {
      class RefComponent extends React.Component {
        render() {
          return <div ref="foo" />;
        }
      }
      const e = await render(<RefComponent />);
      expect(e.getAttribute('ref')).toBe(null);
    });

    itRenders('no children attribute', async render => {
      const e = await render(React.createElement('div', {}, 'foo'));
      expect(e.getAttribute('children')).toBe(null);
    });

    itRenders('no key attribute', async render => {
      const e = await render(<div key="foo" />);
      expect(e.getAttribute('key')).toBe(null);
    });

    itRenders('no dangerouslySetInnerHTML attribute', async render => {
      const e = await render(
        <div dangerouslySetInnerHTML={{__html: '<foo />'}} />,
      );
      expect(e.getAttribute('dangerouslySetInnerHTML')).toBe(null);
    });

    itRenders('no suppressContentEditableWarning attribute', async render => {
      const e = await render(<div suppressContentEditableWarning={true} />);
      expect(e.getAttribute('suppressContentEditableWarning')).toBe(null);
    });

    itRenders('no suppressHydrationWarning attribute', async render => {
      const e = await render(<span suppressHydrationWarning={true} />);
      expect(e.getAttribute('suppressHydrationWarning')).toBe(null);
    });
  });
});
