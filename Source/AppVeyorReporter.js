function AppVeyorReporter(runner) {
  var tests = []

  function mapTest(test) {
    return {
      testName: test.fullTitle(),
      testFramework: 'Mocha',
      fileName: test.file,
      outcome: test.state === 'passed' ? 'Passed' : undefined,
      durationMilliseconds: test.duration
    }
  }

  runner.on('pass', function(test){
    tests.push(mapTest(test))
  })

  runner.on('pending', function(mochaTest) {
    var test = mapTest(mochaTest)
    test.outcome = 'Ignored'
    tests.push(test)
  })

  runner.on('fail', function(mochaTest, err) {
    var test = mapTest(mochaTest)
    test.outcome = 'Failed'
    test.ErrorMessage = err.message
    test.ErrorStackTrace = err.stack
    tests.push(test)
  })

  runner.on('end', function(failures) {
    if (typeof XMLHttpRequest !== 'undefined') {
      var xmlhttp = new XMLHttpRequest()
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 ) {
          // done
        }
      }

      xmlhttp.open('PUT', process.env.APPVEYOR_API_URL + '/api/tests/batch', false)
      xmlhttp.setRequestHeader('Content-type', 'application/json')
      xmlhttp.send(JSON.stringify(tests))
    } else {
      require('request-json').newClient(process.env.APPVEYOR_API_URL).post('api/tests/batch', tests, function(err, body, resp) {
        process.exit(tests.filter(function(t) { return t.outcome === 'Failed' }).length || (err ? -1 : 0))
      })
    }
  })
}

module.exports = AppVeyorReporter