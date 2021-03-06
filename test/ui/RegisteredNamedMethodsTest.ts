import * as RegisteredNamedMethod from '../../src/ui/Base/RegisteredNamedMethods';
import {IMockEnvironment, MockEnvironmentBuilder} from '../MockEnvironment';
import {$$} from '../../src/utils/Dom';
import {Component} from '../../src/ui/Base/Component';
import {Searchbox} from '../../src/ui/Searchbox/Searchbox';
import {FakeResults} from '../Fake';
import {IAnalyticsClient} from '../../src/ui/Analytics/AnalyticsClient';
import {mockUsageAnalytics} from '../MockEnvironment';

export function RegisteredNamedMethodsTest() {
  describe('RegisteredNamedMethods', () => {
    let env: IMockEnvironment;
    let searchbox: HTMLElement;
    let root: HTMLElement;

    beforeEach(() => {
      env = new MockEnvironmentBuilder().build();
      searchbox = $$('div', {
        className: 'CoveoSearchbox'
      }).el;
      root = $$('div').el;
      root.appendChild(searchbox);
    });

    afterEach(() => {
      env = null;
      searchbox = null;
    });

    it('should allow to call state correctly', () => {
      RegisteredNamedMethod.state(env.root, 'q', 'foobar');
      expect(env.queryStateModel.set).toHaveBeenCalledWith('q', 'foobar', jasmine.any(Object));

      RegisteredNamedMethod.state(env.root, 'q');
      expect(env.queryStateModel.get).toHaveBeenCalledWith('q');
    });

    it('should allow to call init correctly', () => {
      expect(() => RegisteredNamedMethod.init(root, {
        Searchbox: { addSearchButton: false },
        SearchInterface: { autoTriggerQuery: false }
      })).not.toThrow();
      expect((<Component>Component.get(searchbox)).options.addSearchButton).toBe(false);
    });

    it('should allow to call initSearchbox correctly', () => {
      expect(() => RegisteredNamedMethod.initSearchbox(root, '/search', {
        Searchbox: { addSearchButton: false },
        SearchInterface: { autoTriggerQuery: false }
      })).not.toThrow();
      expect((<Component>Component.get(searchbox)).options.addSearchButton).toBe(false);
      expect((<Component>Component.get(searchbox)).options.triggerQueryOnClear).toBe(false);
    });

    it('should allow to call init recommendation correctly', () => {
      expect(() => RegisteredNamedMethod.initRecommendation(root, undefined, undefined, {
        Searchbox: { addSearchButton: false },
        SearchInterface: { autoTriggerQuery: false }
      })).not.toThrow();

      expect((<Component>Component.get(searchbox)).options.addSearchButton).toBe(false);
    });

    it('should allow to call execute query', () => {
      RegisteredNamedMethod.executeQuery(env.root);
      expect(env.queryController.executeQuery).toHaveBeenCalled();
    });

    it('should allow to call get', () => {
      RegisteredNamedMethod.init(root, {
        Searchbox: { addSearchButton: false },
        SearchInterface: { autoTriggerQuery: false }
      });

      expect(RegisteredNamedMethod.get(searchbox) instanceof Searchbox).toBe(true);
    });

    it('should allow to call result', () => {
      let fakeResult = FakeResults.createFakeResult();
      let resultElement = $$('div', {
        className: 'CoveoResult'
      });
      resultElement.el['CoveoResult'] = fakeResult;
      root.appendChild(resultElement.el);
      resultElement.el.appendChild(searchbox);
      RegisteredNamedMethod.init(root, {
        Searchbox: { addSearchButton: false },
        SearchInterface: { autoTriggerQuery: false }
      });
      expect(RegisteredNamedMethod.result(searchbox)).toBe(fakeResult);
    });

    it('should allow to pass options ahead of init', () => {
      RegisteredNamedMethod.options(root, { Searchbox: { enableOmnibox: true } });
      RegisteredNamedMethod.init(root, {
        Searchbox: { addSearchButton: false },
        SearchInterface: { autoTriggerQuery: false }
      });
      expect((<Component>Component.get(searchbox)).options.enableOmnibox).toBe(true);
    });

    it('should allow to patch', () => {
      RegisteredNamedMethod.init(root, {
        Searchbox: { addSearchButton: false },
        SearchInterface: { autoTriggerQuery: false }
      });
      let spy = jasmine.createSpy('submit');
      RegisteredNamedMethod.patch(searchbox, 'disable', spy);
      (<Searchbox>Component.get(searchbox)).disable();
      expect(spy).toHaveBeenCalled();
    });

    describe('with analytics', () => {
      let analyticsElement: HTMLElement;
      let analytics: { [key: string]: IAnalyticsClient };

      beforeEach(() => {
        analyticsElement = $$('div', {
          className: 'CoveoAnalytics'
        }).el;
        analytics = { client: mockUsageAnalytics() };
        analyticsElement['CoveoAnalytics'] = analytics;
        analyticsElement['CoveoBoundComponents'] = [analytics];
        env.root.appendChild(analyticsElement);
      });

      afterEach(() => {
        analyticsElement = null;
        analytics = null;
      });

      it('should allow to log search event', () => {
        RegisteredNamedMethod.logSearchEvent(env.root, { name: 'foo', type: 'bar' }, {});
        expect(analytics['client'].logSearchEvent).toHaveBeenCalledWith(jasmine.objectContaining({
          name: 'foo',
          type: 'bar'
        }), jasmine.any(Object));
      });

      it('should allow to log a custom event', () => {
        RegisteredNamedMethod.logCustomEvent(env.root, { name: 'foo', type: 'bar' }, {});
        expect(analytics['client'].logCustomEvent).toHaveBeenCalledWith(jasmine.objectContaining({
          name: 'foo',
          type: 'bar'
        }), jasmine.any(Object), env.root);
      });

      it('should allow to log a search as you type event', () => {
        RegisteredNamedMethod.logSearchAsYouTypeEvent(env.root, { name: 'foo', type: 'bar' }, {});
        expect(analytics['client'].logSearchAsYouType).toHaveBeenCalledWith(jasmine.objectContaining({
          name: 'foo',
          type: 'bar'
        }), jasmine.any(Object));
      });

      it('should allow to log a click event', () => {
        let fakeResult = FakeResults.createFakeResult();
        RegisteredNamedMethod.logClickEvent(env.root, { name: 'foo', type: 'bar' }, {}, fakeResult);
        expect(analytics['client'].logClickEvent).toHaveBeenCalledWith(jasmine.objectContaining({
          name: 'foo',
          type: 'bar'
        }), jasmine.any(Object), fakeResult, env.root);
      });
    });
  });
}
