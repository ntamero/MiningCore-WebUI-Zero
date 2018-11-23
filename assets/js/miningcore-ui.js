// config
var API = 'https://apizero.easymine.rocks/api/'; // API address
var defaultPool = 'zero'; // Default Pool ID

var currentPool = defaultPool;

// private function
function _formatter(value, decimal, unit) {
    if (value === 0) {
        return '0 ' + unit;
    } else {
        var si = [
            { value: 1e-3, symbol: "m" },
            { value: 1, symbol: "" },
            { value: 1e3, symbol: "k" },
            { value: 1e6, symbol: "M" },
            { value: 1e9, symbol: "G" },
            { value: 1e12, symbol: "T" },
            { value: 1e15, symbol: "P" },
            { value: 1e18, symbol: "E" },
            { value: 1e21, symbol: "Z" },
            { value: 1e24, symbol: "Y" },
        ];
        for (var i = si.length - 1; i > 0; i--) {
            if (value >= si[i].value) {
                break;
            }
        }
        return (value / si[i].value).toFixed(decimal).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + ' ' + si[i].symbol + unit;
    }
}

function loadPools(renderCallback) {
    $('#currentPool b').remove();
    $('#currentPool ul').remove();
    return $.ajax(API + 'pools')
        .done(function (data) {
            var poolList = '<ul class="dropdown-menu">';
            if (data.pools.length > 1) {
                $('#currentPool').attr('data-toggle', 'dropdown');
                $('#currentPool').append('<b class="caret"></b>');
            }
            $.each(data.pools, function (index, value) {
                if (currentPool.length === 0 && index === 0) {
                    currentPool = value.id;
                }
                if (currentPool === value.id) {
                    $('#currentPool p').attr('data-id', value.id);
                    $('#currentPool p').text(value.coin.type);
                } else {
                    poolList += '<li><a href="javascript:void(0)" data-id="' + value.id + '">' + value.coin.type + '</a></li>';
                }
            });
            poolList += '</ul>';
            if (poolList.length > 0) {
                $('#poolList').append(poolList);
            }
            if (data.pools.length > 1) {
                $('#poolList li a').on('click', function (event) {
                    currentPool = $(event.target).attr('data-id');
                    loadPools(renderCallback);
                });
            }
            if (renderCallback.has()) {
                renderCallback.fire();
            }
        })
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadPools)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}

function loadStatsData() {
    return $.ajax(API + 'pools')
        .done(function (data) {
            $.each(data.pools, function (index, value) {
                if (currentPool === value.id) {
                    //$('#poolShares').text(_formatter(value, 0, ''));
                    //$('#poolBlocks').text(_formatter(value, 0, ''));
					var PoolisOfPercent = ((value.poolStats.poolHashrate / value.networkStats.networkHashrate) * 100);
                    $('#networkType').text(_formatter(value.poolStats.networkType, 0, ''));
					$('#poolMiners').text(_formatter(value.poolStats.connectedMiners, 0, ''));
					$('#poolMinPay').text(value.paymentProcessing.minimumPayment.toFixed(2), 0, '');
					$('#poolMinPayFull').text(value.paymentProcessing.minimumPayment.toFixed(2) + ' ' + value.coin.type);
					$('#coinSymbol').text(value.coin.type);
					$('#coinName').text(value.coin.name);
					$('#coinFamily').text(value.coin.family);
					$('#coinAlgo').text(value.coin.algorithm);
                    $('#poolHashRate').text(_formatter(value.poolStats.poolHashrate, 5, 'Sols/s'));
					$('#sharesPerSecond').text(_formatter(value.poolStats.sharesPerSecond, 5, 'Sols/s'));
                    $('#networkHashRate').text(_formatter(value.networkStats.networkHashrate, 5, 'Sols/s'));
                    $('#networkDifficulty').text(_formatter(value.networkStats.networkDifficulty, 5, ''));
					$('#nextNetworkBits').text(value.networkStats.nextNetworkBits);
					$('#lastNetworkBlockTime').text( new Date(value.networkStats.lastNetworkBlockTime).toLocaleString() );
					$('#nextNetworkTarget').text(value.networkStats.nextNetworkTarget.substring(0, 11) + '..');
					$('#networkType').text(value.networkStats.networkType + 'net');
					$('#networkCoinType').text(value.coin.name + ' ' + value.networkStats.networkType + 'net');
					$('#blockHeight').text(value.networkStats.blockHeight);
					$('#connectedPeers').text(value.networkStats.connectedPeers);
					$('#payoutScheme').text(value.paymentProcessing.payoutScheme);
					$('#addressInfoLink').text(value.addressInfoLink);
					$('#totalPaid').text(_formatter(value.totalPaid, 2, ''));
					$('#totalPaidFull').text(_formatter(value.totalPaid, 2, '') + ' ' + value.coin.type);
					$('#rewardType').text(value.networkStats.rewardType);
					$('#blockConfirmations').text(value.paymentProcessing.minimumConfirmations);
					$('#connectedPeers').text(value.networkStats.connectedPeers);
					$('#payoutFactor').text(value.paymentProcessing.payoutSchemeConfig.factor);
					$('#payoutType').text((value.paymentProcessing.payoutScheme) + ' ' + '(' + (value.paymentProcessing.payoutSchemeConfig.factor) + ')');
					$('#poolFeePercent').text((value.poolFeePercent * 100).toFixed(2)+ ' %');
					$('#poolPercentofNetwork').text(PoolisOfPercent.toFixed(3) + ' %');
					$('#poolEstimatedBlocks').text((PoolisOfPercent * 720 / 100).toFixed(4));
                }
            });
        })
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadStatsData)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}

function loadStatsChart() {
    return $.ajax(API + 'pools/' + currentPool + '/performance')
        .done(function (data) {
            labels = [];
			baseLine = [];
            connectedMiners = [];
            networkHashRate = [];
            poolHashRate = [];
            $.each(data.stats, function (index, value) {
                if (labels.length === 0 || (labels.length + 1) % 4 === 1) {
                    labels.push(new Date(value.created).toISOString().slice(11, 16));
                } else {
                    labels.push('');
                }
                networkHashRate.push(value.networkHashrate);
                poolHashRate.push(value.poolHashrate);
                connectedMiners.push(value.connectedMiners);
            });
            var data = {
                labels: labels,
                series: [
                    poolHashRate,
                ],
            };
            var data2 = {
                labels: labels,
                series: [
                    baseLine,
                    networkHashRate,
                ],
            };
            var options = {
                showArea: true,
                height: "245px",
                axisX: {
                    showGrid: false,
                },
                axisY: {
                    offset: 47,
                    labelInterpolationFnc: function(value) {
                        return _formatter(value, 1, '');
                    }
                },
                lineSmooth: Chartist.Interpolation.simple({
                    divisor: 2,
                }),
            };
            var responsiveOptions = [
                ['screen and (max-width: 640px)', {
                    axisX: {
                        labelInterpolationFnc: function (value) {
                            return value[0];
                        }
                    },
                }],
            ];
            Chartist.Line('#chartStatsHashRate', data, options, responsiveOptions);
            var options = {
                showArea: true,
                height: "245px",
                axisX: {
                    showGrid: false,
                },
                axisY: {
                    offset: 47,
                    labelInterpolationFnc: function(value) {
                        return _formatter(value, 1, '');
                    }
                },
                lineSmooth: Chartist.Interpolation.simple({
                    divisor: 2,
                }),
            };
            var responsiveOptions = [
                ['screen and (max-width: 640px)', {
                    axisX: {
                        labelInterpolationFnc: function (value) {
                            return value[0];
                        }
                    },
                }],
            ];
            Chartist.Line('#chartStatsNetworkHashRate', data2, options, responsiveOptions);
            var data = {
                labels: labels,
                series: [
                    connectedMiners,
                ],
            };
            var options = {
                height: "245px",
                axisX: {
                    showGrid: false,
                },
                lineSmooth: Chartist.Interpolation.simple({
                    divisor: 2,
                }),
            };
            var responsiveOptions = [
                ['screen and (max-width: 640px)', {
                    axisX: {
                        labelInterpolationFnc: function (value) {
                            return value[0];
                        }
                    },
                }],
            ];
            Chartist.Line('#chartStatsMiners', data, options, responsiveOptions);
        })
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadStatsChart)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}

function loadDashboardData(walletAddress) {
    return $.ajax(API + 'pools/' + currentPool + '/miners/' + walletAddress)
        .done(function (data) {
            $('#pendingShares').text(data.pendingShares);
            var workerHashRate = 0;
            $.each(data.performance.workers, function (index, value) {
                workerHashRate += value.hashrate;
            });
            $('#minerHashRate').text(_formatter(workerHashRate, 5, 'Sols/s'));
            $('#pendingBalance').text(_formatter(data.pendingBalance, 8, 'ZER'));
            $('#paidBalance').text(_formatter(data.totalPaid, 8, 'ZER'));
            $('#paidToday').text(_formatter(data.todayPaid, 8, 'ZER'));
        })
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadDashboardData)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}

function loadDashboardWorkerList(walletAddress) {
    return $.ajax(API + 'pools/' + currentPool + '/miners/' + walletAddress + '/performance')
        .done(function (data) {
		    var totalRigs = 0;
            var workerList = '<thead><th>Rig</th><th>Name</th><th>Hash Rate</th><th>Share Rate</th></thead><tbody>';
            if (data.length > 0) {
                $.each(data[0].workers, function (index, value) {
                    workerList += '<tr>';
					totalRigs++;
					workerList += '<td>' + totalRigs; + '</td>';
                    if (index.length === 0) {
                        workerList += '<td>Unnamed</td>';
                    } else {
                        workerList += '<td>' + index + '</td>';
                    }
                    workerList += '<td>' + _formatter(value.hashrate, 5, 'Sols/s') + '</td>';
                    workerList += '<td>' + _formatter(value.sharesPerSecond, 5, 'S/s') + '</td>';
                    workerList += '</tr>';
                });
            } else {
                workerList += '<tr><td colspan="4">None</td></tr>';
            }
			workerList += '<tr>';
			workerList += '<td colspan="4"><b>Total Rig Count: ' + totalRigs; + '</b></td>';
			workerList += '</tr>';
			workerList += '<tr>';
			workerList += '<td><i>Rigs can take time to appear.<i/></td>';
			workerList += '<td colspan="3"><b>API DATA Direct link for miner: <a href="' + API + 'pools/' + currentPool +'/miners/' + walletAddress + '"target="_new"</a>' + walletAddress + '<b/></td>';
			workerList += '</tr>';
            workerList += '</tbody>';
            $('#workerList').html(workerList);
        })
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadDashboardWorkerList)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}

function loadDashboardPaymentList(walletAddress) {
    return $.ajax(API + 'pools/' + currentPool + '/miners/' + walletAddress + '/payments?pageSize=200')
        .done(function (data) {
            var paymentList = '<thead><tr><th>Date &amp; Time</th><th>Transaction ID</th><th>Amount</th></tr></thead><tbody>';
            if (data.length > 0) {
                $.each(data, function (index, value) {
                    paymentList += '<tr>';
                    paymentList += '<td>' + new Date(value.created).toLocaleString() + '</td>';
                    paymentList += '<td><a href="' + value.transactionInfoLink + '" target="_blank">' + value.transactionConfirmationData.substring() + ' </a></td>';
                    paymentList += '<td>' + _formatter(value.amount, 5, '') + '</td>';
                    paymentList += '</tr>';
                });
            } else {
                paymentList += '<tr><td colspan="3">None</td></tr>';
            }
            paymentList += '</tbody>';
            $('#dashboardPaymentList').html(paymentList);
        })
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadDashroardPaymentsList)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}

function loadDashboardChart(walletAddress) {
    return $.ajax(API + 'pools/' + currentPool + '/miners/' + walletAddress + '/performance')
        .done(function (data) {
            if (data.length > 0) {
                labels = [];
                minerHashRate = [];
                $.each(data, function (index, value) {
                    if (labels.length === 0 || (labels.length + 1) % 4 === 1) {
                        labels.push(new Date(value.created).toISOString().slice(11, 16));
                    } else {
                        labels.push('');
                    }
                    var workerHashRate = 0;
                    $.each(value.workers, function (index2, value2) {
                        workerHashRate += value2.hashrate;
                    });
                    minerHashRate.push(workerHashRate);
                });
                var data = {
                    labels: labels,
                    series: [
                        minerHashRate,
                    ],
                };
                var options = {
                    showArea: true,
                    height: "245px",
                    axisX: {
                        showGrid: false,
                    },
                    axisY: {
                        offset: 47,
                        labelInterpolationFnc: function(value) {
                            return _formatter(value, 1, '');
                        }
                    },
                    lineSmooth: Chartist.Interpolation.simple({
                        divisor: 2,
                    }),
                };
                var responsiveOptions = [
                    ['screen and (max-width: 640px)', {
                        axisX: {
                            labelInterpolationFnc: function (value) {
                                return value[0];
                            }
                        },
                    }],
                ];
                Chartist.Line('#chartDashboardHashRate', data, options, responsiveOptions);
            }
        })
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadDashboardChart)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}

function loadMinersList() {
    return $.ajax(API + 'pools/' + currentPool + '/miners?pageSize=200')
        .done(function (data) {
            var minerList = '<thead><tr><th>Address</th><th>Hash Rate MAX (Last 24hrs)</th><th>Share Rate MAX (Last 24 hours)</th></tr></thead><tbody>';
	        var zeroaddress = "https://zero.cryptonode.cloud/insight/address/";
            if (data.length > 0) {
                $.each(data, function (index, value) {
                    minerList += '<tr>';
                    minerList += '<td>' + '<a href="' + zeroaddress + value.miner.substring() + '"  target="_new">' + value.miner.substring() + '</a>' + '</td>';
                    //minerList += '<td><a href="' + value.minerAddressInfoLink + '" target="_blank">' + value.miner.substring(0, 12) + ' &hellip; ' + value.miner.substring(value.miner.length - 12) + '</td>';
                    minerList += '<td>' + _formatter(value.hashrate, 5, 'Sols/s') + '</td>';
                    minerList += '<td>' + _formatter(value.sharesPerSecond, 5, 'S/s') + '</td>';
                    minerList += '</tr>';
                });
            } else {
                minerList += '<tr><td colspan="3">None</td></tr>';
            }
            minerList += '</tbody>';
            $('#minerList').html(minerList);
        })
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadMinersList)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}


function loadBlocksList() {
    return $.ajax(API + 'pools/' + currentPool + '/blocks?pageSize=200')
        .done(function (data) {
	console.log(data)
            var blockList = '<thead><tr><th>Timestamp</th><th>Height</th><th>Block Info</th><th>Effort</th><th>Status</th><th>Reward</th><th>Confirmed</th></tr></thead><tbody>';
	        var blockaddress = "https://zero.cryptonode.cloud/insight/block/";
			var zeroaddress = "https://zero.cryptonode.cloud/insight/address/";
            if (data.length > 0) {
                $.each(data, function (index, value) {
					var statusreplace = '0';
					var rewardreplace = '0';
                    blockList += '<tr>';
                    blockList += '<td>' + new Date(value.created).toLocaleString() + '</td>';
                    blockList += '<td>' + value.blockHeight + '</td>';
                    blockList += '<td>Hash: <a href="' + blockaddress + value.hash + '"  target="_new">' + value.hash + ' </a><br />Miner: <a href="' + zeroaddress + value.miner + '"  target="_new">' + value.miner + ' </a></td>';
                    if (typeof(value.effort) !== "undefined") {
                        blockList += '<td>' + Math.round(value.effort * 100) + '%</td>';
                    } else {
                        blockList += '<td>n/a</td>';
                    }
					statusreplace = value.status.replace('pending', 'immature')
					if (value.reward === 0) {
						rewardreplace = 'waiting';
					} else {
                        rewardreplace = _formatter(value.reward, 12, '');
                    }
					if (statusreplace === 'orphaned') {
						rewardreplace = '0';
					}
                    blockList += '<td>' + statusreplace + '</td>';
                    blockList += '<td>' + rewardreplace + '</td>';
                    blockList += '<td>' + Math.round(value.confirmationProgress * 100) + '%</td>';
                    blockList += '</tr>'
                });
            } else {
                blockList += '<tr><td colspan="7">None</td></tr>';
            }
            blockList += '</tbody>';
            $('#blockList').html(blockList);
        })
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadBlocksList)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}


function loadPaymentsList() {
    return $.ajax(API + 'pools/' + currentPool + '/payments?pageSize=500')
        .done(function (data) {
            var paymentList = '<thead><tr><th>Date &amp; Time</th><th>Address</th><th>Amount</th></tr></thead><tbody>';
            if (data.length > 0) {
                $.each(data, function (index, value) {
                    paymentList += '<tr>';
                    paymentList += '<td>' + new Date(value.created).toLocaleString() + '</td>';
                    paymentList += '<td><a href="' + value.addressInfoLink + '" target="_blank">' + value.address.substring() + '</a><br />Transaction ID: <a href="' + value.transactionInfoLink + '" target="_blank">' + value.transactionConfirmationData.substring() + ' </a></td>';
                    paymentList += '<td>' + _formatter(value.amount, 5, '') + '</td>';

                    paymentList += '</tr>';
                });
            } else {
                paymentList += '<tr><td colspan="3">None</td></tr>';
            }
            paymentList += '</tbody>';
            $('#paymentList').html(paymentList);
        })
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadPaymentsList)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}

function loadConnectConfig() {
    return $.ajax(API + 'pools')
        .done(function (data) {
            var connectPoolConfig = '<thead><tr><th>Item</th><th>Value</th></tr></thead><tbody>';
            $.each(data.pools, function (index, value) {
                if (currentPool === value.id) {
                    connectPoolConfig += '<tr><td>Algorithm</td><td>' + value.coin.algorithm + '</td></tr>';
                    connectPoolConfig += '<tr><td>Wallet Address</td><td><a href="' + value.addressInfoLink + '" target="_blank">' + value.address.substring() + '</a></td></tr>';
                    connectPoolConfig += '<tr><td>Payout Scheme</td><td>' + value.paymentProcessing.payoutScheme + '</td></tr>';
                    connectPoolConfig += '<tr><td>Minimum Payment w/o #</td><td>' + value.paymentProcessing.minimumPayment + '</td></tr>';
                    if (typeof(value.paymentProcessing.minimumPaymentToPaymentId) !== "undefined") {
                        connectPoolConfig += '<tr><td>Minimum Payment w/ #</td><td>' + value.paymentProcessing.minimumPaymentToPaymentId + '</td></tr>';
                    }
                    connectPoolConfig += '<tr><td>Pool Fee</td><td>' + value.poolFeePercent + '%</td></tr>';
                    $.each(value.ports, function (port, options) {
                        connectPoolConfig += '<tr><td>';
						connectPoolConfig += 'Port ' + port;
						connectPoolConfig += '<br />' + 'Connection';
						connectPoolConfig += '</td><td>';
                        if (typeof(options.varDiff) !== "undefined") {
                            connectPoolConfig += 'Variable / ' + options.varDiff.minDiff + ' &harr; ';
                            if (typeof(options.varDiff.maxDiff) === "undefined") {
                                connectPoolConfig += '&infin;';
                            } else {
                                connectPoolConfig += options.varDiff.maxDiff;
                            }
                        } else {
                            connectPoolConfig += 'Static / ' + options.difficulty;
                        }
						connectPoolConfig += '<br />';
						connectPoolConfig += options.listenAddress + ':'+ port;
                        connectPoolConfig += '</td></tr>';
                    });
                }
            });
            connectPoolConfig += '</tbody>';
            $('#connectPoolConfig').html(connectPoolConfig);
        })
        .fail(function () {
            $.notify({
                icon: "ti-cloud-down",
                message: "Error: No response from API.<br>(loadConnectConfig)",
            }, {
                type: 'danger',
                timer: 3000,
            });
        });
}
