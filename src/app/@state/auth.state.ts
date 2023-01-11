import {createStore, select, withProps} from "@ngneat/elf";
import {persistState} from "@ngneat/elf-persist-state";
import * as localForage from 'localforage';
import {Injectable} from "@angular/core";
import {addEntities} from "@ngneat/elf-entities";

type TAuthProps = {
  device: {id: string} | null
}

const store = createStore({name: 'auth'}, withProps<TAuthProps>({device: null}))

export const persist = persistState(store, {
  key: 'auth',
  storage: localForage,
});

@Injectable({providedIn: 'root'})
export class AuthState {
  device$ = store.pipe(select((state) => state.device));

  init(deviceId: string) {
    store.update((state) => ({
      ...state,
      device: {
        id: deviceId
      }
    }));
  }
}
