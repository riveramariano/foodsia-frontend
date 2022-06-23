import { RUTA_ACTUAL } from '../../types';

// eslint-disable-next-line import/no-anonymous-default-export
export default (state, action) => {
  switch (action.type) {
    case RUTA_ACTUAL:
      return {
        ...state,
        ruta: action.payload,
      }
    default:
      return state;
  }
}
