'use strict';

const utils = require( './utils.js' );
const R = require( 'ramda' ); // eslint-disable-line id-length

function getFlags( data ) {
    return ( data && data.parameters && data.parameters.flags ) ? data.parameters.flags : [];
}

const alias = R.curry(( dataStore, resource, data ) =>
    dataStore.alias( resource, data )
);

const read = R.curry(( dataStore, resource, data ) =>
    dataStore.read( resource, getFlags( data ))
);

const search = R.curry(( dataStore, resource, data ) => {
    if ( !data.parameters || !data.parameters.query ) {
        return Promise.reject( 'INVALID_PARAMETERS' );
    }
    return dataStore.search(
        resource,
        data.parameters.query,
        data.parameters.sort || null,
        getFlags( data )
    );
});

const inspect = R.curry(( dataStore, resource, data ) => {
    const fields = ( data.parameters && data.parameters.fields ) ? data.parameters.fields : null;
    return dataStore.inspect( resource, fields );
});

const download = R.curry(( dataStore, resource ) =>
    dataStore.download( resource, 'zip' )
);

const create = R.curry(( dataStore, resource, data ) => {
    const params = data.parameters;
    if ( !params ||
        !params.name ||
        ( params.mimetype === 'folder' && params.content )
    ) {
        return Promise.reject( 'INVALID_PARAMETERS' );
    }
    return dataStore.create( resource, params.type, params.name, params.content, getFlags( data ));
});

const bulk = R.curry(( dataStore, resource, data ) => {
    if ( !data.parameters || !data.parameters.resources ) {
        return Promise.reject( 'INVALID_PARAMETERS' );
    }
    return dataStore.bulk( resource, data.parameters.resources, getFlags( data ));
});

const copy = R.curry(( dataStore, resource, data ) => {
    if ( !data.parameters || !data.parameters.destination ) {
        return Promise.reject( 'INVALID_PARAMETERS' );
    }
    return dataStore.copy( resource, data.parameters.destination, getFlags( data ));
});

const update = R.curry(( dataStore, resource, data ) => {
    if ( !data.parameters || !data.parameters.content ) {
        return Promise.reject( 'INVALID_PARAMETERS' );
    }
    return dataStore.update( resource, data.parameters.content, getFlags( data ));
});

const move = R.curry(( dataStore, resource, data ) => {
    if ( !data.parameters || !data.parameters.destination ) {
        return Promise.reject( 'INVALID_PARAMETERS' );
    }
    return dataStore.move( resource, data.parameters.destination, getFlags( data ));
});

const rename = R.curry(( dataStore, resource, data ) => {
    if ( !data.parameters || !data.parameters.name ) {
        return Promise.reject( 'INVALID_PARAMETERS' );
    }
    return dataStore.rename( resource, data.parameters.name, getFlags( data ));
});

const destroy = R.curry(( dataStore, resource ) => dataStore.destroy( resource ));

const takeAction = R.curry(( permissions, methods, resource, userId, data ) => {
    if ( !resource ) {
        return Promise.reject( utils.errorResponse( 'INVALID_RESOURCE' ));
    }

    if ( !data || !data.action ) {
        return methods.default( resource, data )
        .catch( err => Promise.reject( utils.errorResponse( err )));
    }

    if ( !methods.hasOwnProperty( data.action )) {
        return Promise.reject( utils.errorResponse( 'INVALID_ACTION' ));
    }

    return Promise.resolve()
    .then(( ) => permissions.verify( resource, userId, data.action ))
    .then(() => methods[ data.action ]( resource, data ))
    .catch( err => Promise.reject( utils.errorResponse( err )));
});


module.exports = configuration => {
    const dataStore = configuration.dataStore;
    const permissions = configuration.permissions;

    const GET = {
        default: read( dataStore ),
        read: read( dataStore ),
        alias: alias( dataStore ),
        search: search( dataStore ),
        inspect: inspect( dataStore ),
        download: download( dataStore ),
    };

    const POST = {
        default: create( dataStore ),
        create: create( dataStore ),
        bulk: bulk( dataStore ),
        copy: copy( dataStore ),
    };

    const PUT = {
        default: update( dataStore ),
        update: update( dataStore ),
        move: move( dataStore ),
        rename: rename( dataStore ),
    };

    const DELETE = {
        default: destroy( dataStore ),
        destroy: destroy( dataStore ),
    };

    const method = takeAction( permissions );

    const res = {};
    res.GET = method( GET );
    res.POST = method( POST );
    res.PUT = method( PUT );
    res.DELETE = method( DELETE );
    res.read = GET.read;
    res.alias = GET.alias;
    res.search = GET.search;
    res.inspect = GET.inspect;
    res.download = GET.download;
    res.create = POST.create;
    res.bulk = POST.bulk;
    res.copy = POST.copy;
    res.update = PUT.update;
    res.move = PUT.move;
    res.rename = PUT.rename;
    res.destroy = PUT.destroy;

    return res;
};
