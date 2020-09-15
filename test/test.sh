env="test"
export NODE_ENV=$env
jest --forceExit --runInBand --coverage --forceExit
# jest test/record.e2e-spec  --runInBand --forceExit