import { Button } from './components/ui/button';
import { Input } from './components/ui/input';

function App() {
  return (
    <div className='min-h-svh flex items-center justify-center'>
      <div className='w-full max-w-2xl my-10 px-4'>
        <h1 className='text-center sm:text-left text-4xl tracking-tighter'>
          Selecione um arquivo:
        </h1>
        <form className='space-y-4 mt-5'>
          <Input className='cursor-pointer' type='file' />
          <Button className='w-full cursor-pointer' type='submit'>
            Enviar
          </Button>
        </form>
      </div>
    </div>
  );
}

export default App;
