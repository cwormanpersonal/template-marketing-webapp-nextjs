import { useCtfQuoteQuery } from './__generated/ctf-quote.generated';
import { CtfQuote } from './ctf-quote';

interface CtfQuoteGqlPropsInterface {
  id: string;
  locale: string;
  preview: boolean;
}

const CtfQuoteGql = (props: CtfQuoteGqlPropsInterface) => {
  const { id, locale, preview } = props;

  const { isLoading, data } = useCtfQuoteQuery({
    id,
    locale,
    preview,
  });

  if (isLoading || !data?.componentQuote) {
    return null;
  }

  return <CtfQuote {...data.componentQuote} />;
};

export default CtfQuoteGql;
