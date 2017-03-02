'use strict';
/*******************************************************************************
 * Copyright (c) 2015 IBM Corp.
 *
 * All rights reserved.
 *
 * This module provides wrappers for the operations on chaincode that this demo
 * needs to perform.
 *
 * Contributors:
 *   Dale Avery - Initial implementation
 *
 * Created by davery on 11/8/2016.
 *******************************************************************************/

// For logging
var TAG = 'chaincode_ops:';

var async = require('async');

/**
 * A helper object for interacting with the commercial paper chaincode.  Has functions for all of the query and invoke
 * functions that are present in the chaincode.
 * @param chain A configured hfc chain object.
 * @param chaincodeID The ID returned in the deploy request for this chaincode.
 * @constructor
 */
function CPChaincode(chain, chaincodeID) {
    if (!(chain && chaincodeID))
        throw new Error('Cannot create chaincode helper without both a chain object and the chaincode ID!');
    this.chain = chain;
    this.chaincodeID = chaincodeID;

    // Add an optional queue for processing chaincode related tasks.  Prevents "timer start called twice" errors from
    // the SDK by only processing one request at a time.
    this.queue = async.queue(function (task, callback) {
        task(callback);
    }, 1);
}
module.exports.CPChaincode = CPChaincode;

CPChaincode.prototype.releaseInventory = function (uid, inputArgs, cb) {
    console.log(TAG, '- releaseInventory uid: ', uid);
    console.log(TAG, '- releaseInventory input args: ', JSON.stringify(inputArgs));
    var releaseInventory = {
        chaincodeID: this.chaincodeID,
        fcn: 'releaseInventory',
        args: inputArgs
    };

    invoke(this.chain, uid, releaseInventory, function (err, result) {
        if (err) {
            console.error(TAG, 'failed release Inventory:', err);
            return cb(err);
        }

        console.log(TAG, 'releaseInventory successfully:', result.toString());
        cb(null, result);
    });
}

CPChaincode.prototype.queryPlaceOrders = function (enrollID, inputArgs, cb) {
    console.log(TAG, 'queryPlaceOrders - chaincode_ops:', enrollID);

    var queryPlaceOrdersReq = {
        chaincodeID: this.chaincodeID,
        fcn: 'queryPlaceOrders',
        args: inputArgs
    };

    query(this.chain, enrollID, queryPlaceOrdersReq, function (err, qResponse) {
        if (err) {
            console.error(TAG, 'failed to get queryPlaceOrdersReq:', err);
            return cb(err);
        }

        console.log(TAG, 'retrieved queryPlaceOrdersReq information:', qResponse.toString());
        cb(null, qResponse.toString());
    });
};


/**
 * Create an account on the commercial paper trading network.  The given enrollID will also be taken as the name for the
 * commercial paper trading account.
 * @param enrollID The enrollID for the user submitting the transaction.
 * @param cb A callback function of the form: function(error)
 */
CPChaincode.prototype.createCompany = function (enrollID, cb) {
    console.log(TAG, 'Creating a company for:', enrollID);

    // Accounts will be named after the enrolled users
    var createRequest = {
        chaincodeID: this.chaincodeID,
        fcn: 'createAccount',
        args: [enrollID]
    };

    invoke(this.chain, enrollID, createRequest, function (err, result) {
        if (err) {
            console.error(TAG, 'failed to create company:', err);
            return cb(err);
        }

        console.log(TAG, 'Created company successfully:', result.toString());
        cb(null, result);
    });
};


CPChaincode.prototype.updateCoverage = function (enrollID, inputArgs, cb) {
    console.log(TAG, 'Creating a company for:', enrollID);

    // Accounts will be named after the enrolled users
    var createRequest = {
        chaincodeID: this.chaincodeID,
        fcn: 'updateCoverage',
        args: inputArgs
    };

    invoke(this.chain, enrollID, createRequest, function (err, result) {
        if (err) {
            console.error(TAG, 'failed to create company:', err);
            return cb(err);
        }

        console.log(TAG, 'Created company successfully:', result.toString());
        cb(null, result);
    });
};

CPChaincode.prototype.addCoverage = function (enrollID, inputArgs, cb) {
    console.log(TAG, 'Creating a company for:', enrollID);

    // Accounts will be named after the enrolled users
    var createRequest = {
        chaincodeID: this.chaincodeID,
        fcn: 'addCoverage',
        args: inputArgs
    };

    invoke(this.chain, enrollID, createRequest, function (err, result) {
        if (err) {
            console.error(TAG, 'failed to create company:', err);
            return cb(err);
        }

        console.log(TAG, 'Created company successfully:', result.toString());
        cb(null, result);
    });
};


/**
 * Query the chaincode for the given account.
 * @param enrollID The user that the query should be submitted through.
 * @param company The name of the company we want the account info for.
 * @param cb A callback of the form: function(error, company_data)
 */
CPChaincode.prototype.getCompany = function (enrollID, company, cb) {
    console.log(TAG, 'getting information on company:', company);

    var getCompanyRequest = {
        chaincodeID: this.chaincodeID,
        fcn: 'GetCompany',
        args: [company]
    };

    query(this.chain, enrollID, getCompanyRequest, function (err, company) {
        if (err) {
            console.error(TAG, 'failed to get company:', err);
            return cb(err);
        }

        console.log(TAG, 'retrieved company information:', company.toString());
        cb(null, company.toString());
    });
};

/**
 * Invoke the chaincode to create a new commercial paper.
 * @param enrollID The user that the invoke should be submitted through.
 * @param paper The object representing the new paper.
 * @param cb A callback of the form: function(error, result)
 */
CPChaincode.prototype.createPaper = function (enrollID, paper, cb) {
    console.log(TAG, 'creating a new commercial paper');

    // Paper information will be generated by the UI
    var createPaperRequest = {
        chaincodeID: this.chaincodeID,
        fcn: 'issueCommercialPaper',
        args: [JSON.stringify(paper)]
    };

    invoke(this.chain, enrollID, createPaperRequest, function (err, result) {
        if (err) {
            console.error(TAG, 'failed to create paper:', err);
            return cb(err);
        }

        console.log(TAG, 'Created paper successfully:', result.toString());
        cb(null, result);
    });
};

/**
 * Invoke the chaincode to transfer ownership of a commercial paper.
 * @param enrollID The user that the invoke should be submitted through.
 * @param paper The object representing the transfer information.  See chaincode for more info.
 * @param cb A callback of the form: function(error, result)
 */
CPChaincode.prototype.transferPaper = function (enrollID, paper, cb) {
    console.log(TAG, 'transferring a commercial paper');

    // Paper information will be generated by the UI
    var transferRequest = {
        chaincodeID: this.chaincodeID,
        fcn: 'transferPaper',
        args: [JSON.stringify(paper)]
    };

    invoke(this.chain, enrollID, transferRequest, function (err, result) {
        if (err) {
            console.error(TAG, 'failed to transfer paper:', err);
            return cb(err);
        }

        console.log(TAG, 'Transferred paper successfully:', result.toString());
        cb(null, result);
    });
};

/**
 * Query the chaincode for the full list of commercial papers.
 * @param enrollID The user that the query should be submitted through.
 * @param cb A callback of the form: function(error, commercial_papers)
 */
CPChaincode.prototype.getPapers = function (enrollID, cb) {
    console.log(TAG, 'getting commercial papers');

    // Accounts will be named after the enrolled users
    var getPapersRequest = {
        chaincodeID: this.chaincodeID,
        fcn: 'GetAllCPs',
        args: [enrollID]
    };

    query(this.chain, enrollID, getPapersRequest, function (err, papers) {

        if (err) {
            console.error(TAG, 'failed to getPapers:', err);
            return cb(err);
        }

        console.log(TAG, 'got papers');
        cb(null, papers.toString());
    });
};

/**
 * Query the chaincode for the full list of commercial papers.
 * @param enrollID The user that the query should be submitted through.
 * @param cb A callback of the form: function(error, commercial_papers)
 */
CPChaincode.prototype.getBlockchainRecord = function (enrollID, recordKey, cb) {
    console.log(TAG, 'getting commercial papers');

    // Accounts will be named after the enrolled users
    var getPapersRequest = {
        chaincodeID: this.chaincodeID,
        fcn: 'getBlockchainRecord',
        args: [recordKey]
    };

    query(this.chain, enrollID, getPapersRequest, function (err, papers) {

        if (err) {
            console.error(TAG, 'failed to getPapers:', err);
            return cb(err);
        }

        console.log(TAG, 'got papers');
        cb(null, papers.toString());
    });
};


CPChaincode.prototype.getCoverages = function (enrollID, subscriberID, cb) {
    console.log(TAG, 'getting commercial papers');

    // Accounts will be named after the enrolled users
    var getPapersRequest = {
        chaincodeID: this.chaincodeID,
        fcn: 'getCoverages',
        args: [subscriberID]
    };

    query(this.chain, enrollID, getPapersRequest, function (err, papers) {

        if (err) {
            console.error(TAG, 'failed to getPapers:', err);
            return cb(err);
        }

        console.log(TAG, 'got papers');
        cb(null, papers.toString());
    });
};


CPChaincode.prototype.getEmployeeRecord = function (enrollID, employeeId, cb) {
    console.log(TAG, 'getting commercial papers');

    // Accounts will be named after the enrolled users
    var getPapersRequest = {
        chaincodeID: this.chaincodeID,
        fcn: 'getEmployeeRecord',
        args: [employeeId]
    };

    query(this.chain, enrollID, getPapersRequest, function (err, papers) {

        if (err) {
            console.error(TAG, 'failed to getPapers:', err);
            return cb(err);
        }

        console.log(TAG, 'got papers');
        cb(null, papers.toString());
    });
};

CPChaincode.prototype.verifyEmployment = function (enrollID, subscriberId, cb) {
    console.log(TAG, 'getting commercial papers');

    // Accounts will be named after the enrolled users
    var getPapersRequest = {
        chaincodeID: this.chaincodeID,
        fcn: 'verifyEmployment',
        args: [subscriberId]
    };

    query(this.chain, enrollID, getPapersRequest, function (err, papers) {

        if (err) {
            console.error(TAG, 'failed to getPapers:', err);
            return cb(err);
        }

        console.log(TAG, 'got papers');
        cb(null, papers.toString());
    });
};

CPChaincode.prototype.verifyCoverage = function (enrollID, subscriberId, memberId, cb) {
    console.log(TAG, 'getting commercial papers');

    // Accounts will be named after the enrolled users
    var getPapersRequest = {
        chaincodeID: this.chaincodeID,
        fcn: 'verifyCoverage',
        args: [subscriberId, memberId]
    };

    query(this.chain, enrollID, getPapersRequest, function (err, papers) {

        if (err) {
            console.error(TAG, 'failed to getPapers:', err);
            return cb(err);
        }

        console.log(TAG, 'got papers');
        cb(null, papers.toString());
    });
};




/**
 * Helper function for invoking chaincode using the hfc SDK.
 * @param chain A hfc chain object representing our network.
 * @param enrollID The enrollID for the user we should use to submit the invoke request.
 * @param requestBody A valid hfc invoke request object.
 * @param cb A callback of the form: function(error, invoke_result)
 */
function invoke(chain, enrollID, requestBody, cb) {

    // Submit the invoke transaction as the given user
    console.log(TAG, 'Invoke transaction as:', enrollID);
    chain.getMember(enrollID, function (getMemberError, usr) {
        if (getMemberError) {
            console.error(TAG, 'failed to get ' + enrollID + ' member:', getMemberError.message);
            if (cb) cb(getMemberError);
        } else {
            console.log(TAG, 'successfully got member:', enrollID);

            console.log(TAG, 'invoke body:', JSON.stringify(requestBody));
            var invokeTx = usr.invoke(requestBody);

            // Print the invoke results
            invokeTx.on('completed', function (results) {
                // Invoke transaction submitted successfully
                console.log(TAG, 'Successfully completed invoke. Results:', results);
                cb(null, results);
            });
            invokeTx.on('submitted', function (results) {
                // Invoke transaction submitted successfully
                console.log(TAG, 'invoke submitted');
                cb(null, results);
            });
            invokeTx.on('error', function (err) {
                // Invoke transaction submission failed
                console.log(TAG, 'invoke failed. Error:', err);
                cb(err);
            });
        }
    });
}

/**
 * Helper function for querying chaincode using the hfc SDK.
 * @param chain A hfc chain object representing our network.
 * @param enrollID The enrollID for the user we should use to submit the query request.
 * @param requestBody A valid hfc query request object.
 * @param cb A callback of the form: function(error, queried_data)
 */
function query(chain, enrollID, requestBody, cb) {

    // Submit the invoke transaction as the given user
    console.log(TAG, 'querying chaincode as:', enrollID);
    chain.getMember(enrollID, function (getMemberError, usr) {
        if (getMemberError) {
            console.error(TAG, 'failed to get ' + enrollID + ' member:', getMemberError.message);
            if (cb) cb(getMemberError);
        } else {
            console.log(TAG, 'successfully got member:', enrollID);

            console.log(TAG, 'query body:', JSON.stringify(requestBody));
            var queryTx = usr.query(requestBody);

            queryTx.on('complete', function (results) {
                console.log(TAG, 'Successfully completed query. Results:', results);
                cb(null, results.result);
            });
            queryTx.on('error', function (err) {
                console.log(TAG, 'query failed. Error:', err);
                cb(err);
            });
        }
    });
}