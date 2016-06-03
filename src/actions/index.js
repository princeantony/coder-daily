import { push, goBack } from 'react-router-redux';
import auth from '../auth';


function buildWebTaskUrl(task, qs) {
    return `https://webtask.it.auth0.com/api/run/wt-hendrik_swanepoel-gmail_com-0/${task}?webtask_no_cache=1${qs || ''}`;
}

export function cancelAdd() {
    return (dispatch) => dispatch(goBack());
}

export const REQUEST_LINKS = 'REQUEST_LINKS';
function requestLinks() {
    return {
        type: REQUEST_LINKS,
    };
}

// use argument destructuring...
export const RECEIVE_LINKS = 'RECEIVE_LINKS';
function receiveLinks(links) {
    return {
        type: RECEIVE_LINKS,
        links,
    };
}

export const REQUEST_TOPICS = 'REQUEST_TOPICS';
function requestTopics() {
    return {
        type: REQUEST_TOPICS,
    };
}

export const RECEIVE_TOPICS = 'RECEIVE_TOPICS';
function receiveTopics(topics) {
    return {
        type: RECEIVE_TOPICS,
        topics,
    };
}

export function startAdd() {
    return (dispatch, getState) => {
        const selectedTopic = getState().main.selectedTopic;
        dispatch(push(`/list/${selectedTopic.name}/add`));
    };
}


export const STORE_AUTH_INFO = 'STORE_AUTH_INFO';

export function checkAuth() {
    return (dispatch, getState) => {

        const idToken = auth.getIdToken();
        const profile = getState().main.profile;


        if (idToken && profile) {
            return dispatch({
                type: STORE_AUTH_INFO,
                idToken,
                profile,
            });
        }


        if (idToken && !getState().main.profile) {
            return auth.getProfile({ idToken })
                .then((loadedProfile) => {
                    if (loadedProfile) {
                        dispatch({
                            type: STORE_AUTH_INFO,
                            idToken,
                            profile: loadedProfile,
                        });
                    }
                });
        }

        return null;
    };
}

export function logOut() {
    return () => {
        auth.logOut();
    };
}

export function showLock() {
    return () => {
        auth.showLock();
    };
}

export const REQUEST_ADD = 'REQUEST_ADD';
export function requestAdd() {
    return {
        type: REQUEST_ADD,
    };
}

export const RECEIVE_ADD = 'RECEIVE_ADD';
export function receiveAdd() {
    return {
        type: RECEIVE_ADD,
    };
}


export function fetchLinks() {
    return (dispatch, getState) => {
        dispatch(requestLinks());
        const selectedTopic = getState().main.selectedTopic;
        fetch(buildWebTaskUrl('coder-daily-links', `&topicId=${selectedTopic.id}`))
        .then(linkResponse => linkResponse.json())
        .then(links => {
            dispatch(receiveLinks(links));
        });
    };
}

export function selectTopic({ topic }) {
    return (dispatch) => {
        // dispatch({
        //     type:,
        //     topic,
        // });
        // dispatch(fetchLinks());

        dispatch(push(`/list/${topic.name}`));
    };
}


export const VOTE_LINK = 'VOTE_LINK';
export function voteLink({ link, increment }) {
    return (dispatch) => {
        dispatch({
            type: VOTE_LINK,
            link,
            increment,
        });
        fetch(`http://localhost:3000/links/${link.id}/vote`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                increment,
            }),
        });
    };
}


// use rxjs, or most, or something like that to
// handle wonkyness with long duration on server
export function add({ url, description }) {
    return (dispatch, getState) => {
        const selectedTopic = getState().main.selectedTopic;
        fetch(buildWebTaskUrl('coder-daily-links'), {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url,
                description,
                topicId: selectedTopic.id,
            }),
        })
        .then(postResponse => {
            if (postResponse.status === 200) {
                dispatch(fetchLinks());
                dispatch(receiveAdd());
            }
        });
    };
}

export function fetchTopics() {
    return (dispatch) => {
        dispatch(requestTopics());

        fetch(buildWebTaskUrl('coder-daily-topics'))
        .then(response => response.json())
        .then(topics => {
            dispatch(receiveTopics(topics));
            dispatch(fetchLinks());
        });
    };
}

export const LOAD_TOPIC = 'LOAD_TOPIC';
export function loadTopic({ selectedTopicName }) {
    return (dispatch, getState) => {
        dispatch({
            type: LOAD_TOPIC,
            selectedTopicName,
        });

        const topics = getState().main.topics;
        if (!topics || topics.length === 0) {
            dispatch(fetchTopics());
        } else {
            dispatch(fetchLinks());
        }
    };
}


export function init() {
    return (dispatch) => {
        dispatch(fetchTopics());
    };
}
