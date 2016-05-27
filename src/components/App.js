import React from 'react';
import Navigation from './Navigation';
import store from '../store';
import { init, selectTopic } from '../actions';
import { browserHistory } from 'react-router';


class App extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = store.getState();

        store.subscribe(() => {
            this.setState(store.getState());
        });
    }

    componentDidMount() {
        store.dispatch(init());
    }

    onTopicSelected = ({ topic }) => {
        store.dispatch(selectTopic({ topic }));
    }

    render() {

        return (
            <div>
                <Navigation
                    topics={this.state.topics}
                    onTopicSelected={this.onTopicSelected}
                />

                {this.props.children}
            </div>
        );
    }
}

App.contextTypes = {
  router: React.PropTypes.object,
};

export default App;
