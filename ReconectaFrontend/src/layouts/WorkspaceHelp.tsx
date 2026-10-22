import { Link } from 'react-router-dom';
import { HelpDisclosure } from '../components/HelpDisclosure';
import styles from './WorkspaceHelp.module.css';

export function WorkspaceHelp() {
  return (
    <HelpDisclosure label="Precisa de ajuda para começar?" variant="wide" defaultOpen>
      <p>Você pode começar pelo que for mais importante agora. Veja o que fazer em cada área:</p>
      <ol className={styles.steps} aria-label="Como usar o painel">
        <li>
          <Link to="/perfil">Meu perfil:</Link> atualize seu nome, telefone, data de nascimento e
          endereço. A alteração de senha fica em uma seção separada.
        </li>
        <li>
          <Link to="/curriculo">Meu currículo:</Link> grave sua experiência para a IA ajudar a
          escrever ou preencha os campos manualmente. Confira a prévia e use o botão no final da
          página para imprimir ou salvar em PDF.
        </li>
        <li>
          <Link to="/vagas-recomendadas">Vagas recomendadas:</Link> depois de atualizar seu
          currículo, peça uma análise da IA para encontrar oportunidades compatíveis com suas
          experiências e habilidades. Confira função, local, remuneração, requisitos, motivo da
          indicação e contato do recrutador. Cada vaga informa se o acompanhamento é por e-mail,
          celular/WhatsApp ou em uma plataforma externa, como Gupy, Indeed ou LinkedIn.
        </li>
        <li>
          <Link to="/minhas-vagas">Minhas vagas:</Link> este será seu espaço para acompanhar as
          candidaturas já enviadas, quando essa função estiver disponível. Para vagas externas, siga
          as orientações do anúncio na plataforma indicada.
        </li>
      </ol>
      <p>
        Use <strong>A+</strong> e <strong>A−</strong> para ajustar o tamanho dos textos ou{' '}
        <strong>Ouvir a página</strong> para escutar as orientações.
      </p>
    </HelpDisclosure>
  );
}
