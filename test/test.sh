env="test"
export NODE_ENV=$env
jest --forceExit --runInBand --coverage --forceExit
# jest test/examQuestion.e2e-spec  --runInBand --forceExit