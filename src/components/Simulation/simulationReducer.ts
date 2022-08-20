/* eslint-disable @typescript-eslint/no-explicit-any */

import _ from 'lodash';
import { Event } from './types';

export interface ISumulationState {
  time: number;
  events: Event[];
  activeEvents: Event[];
  eventDuration: number;
}

export type IAction =
  | {
      type: 'setTime';
      payload: number;
    }
  | {
      type: 'incrementTime';
      payload: number;
    }
  | {
      type: 'setEvents';
      payload: Event[];
    };

export const initialState: ISumulationState = {
  time: 0,
  events: [],
  activeEvents: null,
  eventDuration: 10,
};

export const simulationReducer = (state: ISumulationState, action: IAction): ISumulationState => {
  const { type } = action;

  switch (type) {
    case 'setTime': {
      const currTime = action.payload;

      const activeEvents = _.chain(state.events)
        .filter((node) => {
          return currTime <= node.startTime + state.eventDuration && currTime >= node.startTime;
        })
        .value();

      return { ...state, time: action.payload, activeEvents };
    }
    case 'incrementTime': {
      return { ...state, time: state.time + action.payload };
    }
    case 'setEvents': {
      const events = _.orderBy(action.payload, (node) => node.startTime);

      return { ...state, events };
    }
    default:
      return state;
  }
};
