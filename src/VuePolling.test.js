import { mount, shallowMount } from '@vue/test-utils';
import VuePolling from './VuePolling';

import * as mockData from '../__mock_data__/data';

describe('<VuePolling />', () => {
  let onSuccess = jest.fn(),
    onFailure = jest.fn,
    url = 'http://localhost/session/status';
  describe('success test cases', () => {
    beforeAll(() => {
      window.console.error = jest.fn();
      window.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          json: () => {
            return new Promise(resolve => {
              resolve(mockData.continuePollingResponse);
            });
          },
          ok: true
        })
      );
    });
    test('should render properly with scoped slots props', () => {
      const wrapper = shallowMount(VuePolling, {
        propsData: {
          url: url,
          onSuccess: onSuccess,
          onFailure: onFailure
        },
        slots: {
          'vue-polling': '<div id="pollingSlot" slot="vue-polling"><p>Hi I am polling</p></div>'
        }
      });
      expect(wrapper.findAll('p').length).toBe(1);
      expect(wrapper.findAll('#pollingSlot').length).toBe(1);
    });
    describe('initial tests for checking initial variables before we start polling', () => {
      let wrapper, mockedComponentDidMount;
      beforeEach(() => {
        wrapper = mount(VuePolling, {
          propsData: {
            url: url,
            onSuccess: onSuccess,
            onFailure: onFailure
          },
          slots: {
            'vue-polling': `<div id="pollingSlot" slot="vue-polling"><p>Hi I am polling</p></div>`
          }
        });
      });
      afterEach(() => {
        wrapper = null;
      });
      test('should have right initial state', () => {
        expect(wrapper.vm.isPolling).toBeTruthy();
      });
      test('should have right initial config', () => {
        const expectedConfig = {
          url,
          interval: 3000,
          shouldRetry: false,
          retryCount: 0,
          onSuccess,
          onFailure,
          api: {
            method: 'GET'
          }
        };
        expect(wrapper.vm.config).toMatchObject(expectedConfig);
      });
      test('should have all the function defined', () => {
        expect(wrapper.vm.initConfig).toBeDefined();
        expect(wrapper.vm.config).toBeDefined();
        expect(wrapper.vm.startPolling).toBeDefined();
        expect(wrapper.vm.stopPolling).toBeDefined();
        expect(wrapper.vm.runPolling).toBeDefined();
      });
    });
    describe('tests with polling started', () => {
      test('startPolling function to have been called', () => {
        const mockedStartPolling = jest.fn();
        mount(VuePolling, {
          propsData: {
            url: url,
            onSuccess: onSuccess,
            onFailure: onFailure
          },
          methods: {
            startPolling: mockedStartPolling
          },
          slots: {
            'vue-polling': '<div id="pollingSlot" slot="vue-polling"><p>Hi I am polling</p></div>'
          }
        });
        expect(mockedStartPolling).toHaveBeenCalledTimes(1);
      });
      test('startPolling function to throw an error when no url provided', () => {
        expect(() => {
          mount(VuePolling, {
            propsData: {
              url: null,
              onSuccess: onSuccess,
              onFailure: onFailure
            },
            slots: {
              'vue-polling': '<div id="pollingSlot" slot="vue-polling"><p>Hi I am polling</p></div>'
            }
          });
        }).toThrow();
      });
      test('startPolling should set isPolling state to true, _ismounted to true and call runPolling function', () => {
        const mockedRunPolling = jest.fn();
        const wrapper = shallowMount(VuePolling, {
          propsData: {
            url: url,
            onSuccess: onSuccess,
            onFailure: onFailure
          },
          methods: {
            runPolling: mockedRunPolling
          },
          slots: {
            'vue-polling': '<div id="pollingSlot" slot="vue-polling"><p>Hi I am polling</p></div>'
          }
        });
        expect(wrapper.vm.isPolling).toBeTruthy();
        expect(wrapper.vm._ismounted).toBeTruthy();
        expect(mockedRunPolling).toHaveBeenCalledTimes(1);
      });
      test('stopPolling should set isPolling to false, _ismounted to false and poll to null', () => {
        const wrapper = shallowMount(VuePolling, {
          propsData: {
            url: url,
            onSuccess: onSuccess,
            onFailure: onFailure
          },
          slots: {
            'vue-polling': '<div id="pollingSlot" slot="vue-polling"><p>Hi I am polling</p></div>'
          }
        });
        wrapper.vm.stopPolling();
        expect(wrapper.vm.isPolling).toBeFalsy();
        expect(wrapper.vm._ismounted).toBeTruthy();
        expect(wrapper.vm.poll).toBeNull();
      });
    });
    describe('timer events', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });
      afterEach(() => {
        jest.clearAllTimers();
      });
      test('run Polling should call setTimeout and make api calls at every interval', async () => {
        const mockedOnSuccess = jest.fn(() => {
          return true;
        });
        shallowMount(VuePolling, {
          propsData: {
            url: url,
            onSuccess: mockedOnSuccess,
            onFailure: onFailure
          },
          slots: {
            'vue-polling': '<div id="pollingSlot" slot="vue-polling"><p>Hi I am polling</p></div>'
          }
        });
        expect(setTimeout).toHaveBeenCalledTimes(1);
        jest.runAllTimers();
        expect(fetch).toHaveBeenCalled();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        expect(mockedOnSuccess).toHaveBeenCalled();
        await Promise.resolve();
        expect(setTimeout).toHaveBeenCalledTimes(2);
        jest.runAllTimers();
        expect(fetch).toHaveBeenCalled();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        expect(mockedOnSuccess).toHaveBeenCalled();
      });
    });
    describe('error test cases', () => {
      beforeAll(() => {
        window.fetch = jest.fn().mockImplementation(() => {
          return new Promise((resolve, reject) => {
            reject(true);
          });
        });
      });
      beforeEach(() => {
        jest.useFakeTimers();
      });
      afterEach(() => {
        jest.clearAllTimers();
      });
      test('onFailure should retry equal to config.retryTimes', async () => {
        const retryCount = 4;
        const wrapper = shallowMount(VuePolling, {
          propsData: {
            url: url,
            retryCount: retryCount,
            onSuccess: onSuccess,
            onFailure: onFailure
          },
          slots: {
            'vue-polling': '<div id="pollingSlot" slot="vue-polling"><p>Hi I am polling</p></div>'
          }
        });
        expect(setTimeout).toHaveBeenCalledTimes(1);
        for (let i = 0; i < retryCount; i++) {
          jest.runAllTimers();
          expect(fetch).toHaveBeenCalledTimes(i + 1);
          for (let i = 0; i < retryCount + 1; i++) {
            await Promise.resolve(true);
          }
          expect(wrapper.vm.isPolling).toBeTruthy();
        }
        jest.runAllTimers();
        for (let i = 0; i < retryCount + 1; i++) {
          await Promise.resolve(true);
        }
        expect(wrapper.vm.isPolling).toBeFalsy();
      });
    });
  });
});
