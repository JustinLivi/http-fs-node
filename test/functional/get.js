var chai = require( 'chai' ),
    expect = chai.expect,
    chaiaspromised = require( 'chai-as-promised' ), // more complicated; look that shit up
    sinonchai = require( 'sinon-chai' ),
    sinon = require( 'sinon' ),
    get = require( '../../src/get.js' );

    chai.use( sinonchai );
    chai.use( chaiaspromised );

describe( 'homepage' , function() {
    it( 'should respond be true' , function() {
        expect( true ).to.be.true;
    });

    it( 'should equal 3, cause' , function() {
        return expect( get() ).to.eventually.equal( 3 );
    });
});
